import { mkdirs, writeFileBytes } from './fileUtils';
import { compress, randomUUID } from './zstdUtils';
import { compressImage } from './imgUtils';
import { ProjectMeta } from '../data';


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
    const fillZero = indexString[0] === '0'

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

export const downLoadGroup = async (lastUrl: string, rootPath: string, addLog: (log: string) => void) => {
  const urls = SqPicUrlHelper.urls(lastUrl);
  if (!urls || urls.length == 0) {
    return;
  }

  const taskId: number = Date.now();
  const indexToFileName = [];
  const indexToSmallFileName = [];
  const dirPath = `${rootPath}\\${taskId}`;
  await mkdirs(dirPath);


  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    addLog(`正在加载第${i + 1}张图片，url： ${url}`);
    const buf: Uint8Array | undefined = await sendPicRequest(url);
    if (buf) {
      try {
        const compressed = await compress(buf);
        const uuid = randomUUID();

        const path = `${dirPath}\\${uuid}`;
        await writeFileBytes(path, compressed);

        const smallUUID = randomUUID();
        const compressedImage = await compressImage(buf);

        const smallImg = await compress(compressedImage!!);
        const smallPath = `${dirPath}\\${smallUUID}`;
        await writeFileBytes(smallPath, smallImg);
        addLog(`第${i + 1}张图片，下载成功`);
        indexToSmallFileName[i] = smallUUID;
        indexToFileName[i] = uuid;
      } catch (err) {
        console.error(err);
        addLog(`第${i + 1}张图片，失败，已跳过`);
      }
    } else {
      addLog(`第${i + 1}张图片，失败，已跳过`);
    }
  }

  const path = `${dirPath}\\meta.json`;

  const meta: ProjectMeta = {
    indexToFileName,
    indexToSmallFileName,
    createdAt: taskId,
    name: taskId.toString(),
    lastOpen: taskId
  };
  await writeFileBytes(path, JSON.stringify(meta));
};
