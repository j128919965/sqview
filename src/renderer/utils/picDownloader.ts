import { getPathSep, mkdirs, readFileAsString, writeFileBytes } from './fileUtils';
import { compress, randomUUID } from './zstdUtils';
import { compressImage } from './imgUtils';
import { ProjectIndexData, ProjectMeta } from '../data';
import Toast from '../components';
import ConcurrencyLimiter from './ConcurrencyLimiter';
import { generateIndex } from './metaUtils';


export class SqPicUrlHelper {
  static suffix(url: string): string {
    return url.split('.').pop() ?? '';
  }

  static size(url: string): number {
    const lastDot = url.lastIndexOf('.');
    const lastSplitter = url.lastIndexOf('/');
    return parseInt(url.substring(lastSplitter + 1, lastDot));
  }

  static replaceSizeToTemplate(url: string): string {
    const lastDot = url.lastIndexOf('.');
    const lastSplitter = url.lastIndexOf('/');
    return url.slice(0, lastSplitter + 1) + '{}' + url.slice(lastDot);
  }

  static urls(url: string): Array<string> {
    const lastDot = url.lastIndexOf('.');
    const lastSplitter = url.lastIndexOf('/');
    const indexString = url.substring(lastSplitter + 1, lastDot);
    const fillZero = indexString[0] === '0';

    const size = SqPicUrlHelper.size(url);
    const template = SqPicUrlHelper.replaceSizeToTemplate(url);

    function getRealUrl(index: number) {
      const s = (index + 1).toString();
      return fillZero ? s.padStart(indexString.length, '0') : s;
    }

    return Array.from({ length: size }, (_, index) => template.replace('{}', getRealUrl(index)));
  }

  static toggleSuffix(suffix: string): string {
    return suffix === 'jpg' ? 'png' : 'jpg';
  }
}

export const sendPicRequest = async (str: string): Promise<Uint8Array | undefined> => {
  return window.electron.ipcRenderer
    .invoke('sendPicRequest', str)
    .catch(err => {
      console.error(err);
      return undefined;
    });
};

export type LoadAndSaveGroupOptions = {
  parallel?: boolean,
  addLog?: (log: string) => void,
  setProcess?: (all: number, success: number, failure: number) => void,
  onlyAddFailureLogs?: boolean,
  parallelLimit?: number,
  groupName?: string,
}

export type PicLoadFunc = (url: string) => Promise<Uint8Array | undefined>

const defaultLogAddFunction = (str: string) => {
  console.log(str);
};

const defaultSetProcessFunction = (all: number, success: number, failure: number) => {
  console.log(`load process: all: ${all} success: ${success} failure: ${failure}`);
};

const wrapperLoadFunc = (urls: string[],
                         loadOriginPic: PicLoadFunc,
                         options?: LoadAndSaveGroupOptions): PicLoadFunc => {
  const parallel = options?.parallel ?? false;
  if (!parallel) {
    return loadOriginPic;
  }
  const limit = options?.parallelLimit ?? 0;
  const limiter = new ConcurrencyLimiter(limit);
  const preLoadPromises: Promise<Uint8Array | undefined>[] =
    limit == 0 ?
      // 无限制，则一口气全部加载
      urls.map(loadOriginPic) :
      // 有限制，则加入到队列中，慢慢加载
      urls.map(url => limiter.execute(() => loadOriginPic(url)));

  return (url) => {
    const index = urls.indexOf(url);
    const preLoadPromise = preLoadPromises[index];
    return preLoadPromise != null ? preLoadPromise : loadOriginPic(url);
  };
};

export const loadAndSaveGroup = async (urls: string[],
                                       loadOriginPic: PicLoadFunc,
                                       options?: LoadAndSaveGroupOptions
) => {
  if (!urls || urls.length == 0) {
    return;
  }

  const sep = window.globalState.path_sep
  const addLog = options?.addLog ?? defaultLogAddFunction;
  const setProcess = options?.setProcess ?? defaultSetProcessFunction;
  const all = urls.length;
  let success = 0;
  let failure = 0;
  const addSuccessLog = !(options?.onlyAddFailureLogs ?? false);

  const taskId: number = Date.now();
  const indexToFileName: (string | undefined)[] = [];
  const indexToSmallFileName: (string | undefined)[] = [];
  const dirPath = `${window.globalState.root_dir}${sep}${taskId}`;
  await mkdirs(dirPath);

  const wrappedLoad = wrapperLoadFunc(urls, loadOriginPic, options);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    addSuccessLog && addLog(`正在加载第${i + 1}张图片，url： ${url}`);
    const buf: Uint8Array | undefined = await wrappedLoad(url)
      .catch(err => {
        console.error(err);
        return undefined;
      });
    try {
      if (!buf) {
        throw new Error('buf is null');
      }
      const compressed = await compress(buf);
      const uuid = randomUUID();

      const path = `${dirPath}${sep}${uuid}`;
      await writeFileBytes(path, compressed);
      addSuccessLog && addLog(`第${i + 1}张图片，完成原图写入`);

      const smallUUID = randomUUID();
      const compressedImage = await compressImage(buf);

      const smallImg = await compress(compressedImage!!);
      const smallPath = `${dirPath}${sep}${smallUUID}`;
      await writeFileBytes(smallPath, smallImg);

      addSuccessLog && addLog(`第${i + 1}张图片，加载成功`);
      success++;
      // 有失败，对应的图片应该是 undefined
      indexToSmallFileName[i] = smallUUID;
      indexToFileName[i] = uuid;
    } catch (err) {
      console.error(err);
      addLog(`第${i + 1}张图片，失败，已跳过`);
      failure++;
    }
    setProcess(all, success, failure);
  }


  const path = `${dirPath}${sep}meta.json`;
  const indexPath = `${window.globalState.root_dir}${sep}index.json`

  const meta: ProjectMeta = {
    indexToFileName,
    indexToSmallFileName,
    createdAt: taskId,
    name: options?.groupName ?? taskId.toString(),
    lastOpen: taskId
  };
  await writeFileBytes(path, JSON.stringify(meta));
  // 下载完成后，维护一下 index
  const indexStr = await readFileAsString(indexPath, 'utf-8');
  if (indexStr) {
    let index : ProjectIndexData[] = JSON.parse(indexStr)
    index = [generateIndex([meta])[0], ...index]
    await writeFileBytes(indexPath, JSON.stringify(index))
  }
  addLog(`全部文件加载成功`);
  Toast.success('加载成功');
};
