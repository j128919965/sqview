import { IFileSystem, IZstd, IImage } from '../interfaces';
import ConcurrencyLimiter from '../utils/ConcurrencyLimiter';
import { ProjectMeta, ProjectIndexData } from '../types/data';
import { generateIndex } from '../utils/metaUtils';

export type PicLoadFunc = (url: string) => Promise<Uint8Array | undefined>

export type LoadAndSaveGroupOptions = {
  parallel?: boolean,
  addLog?: (log: string) => void,
  setProcess?: (all: number, success: number, failure: number) => void,
  onlyAddFailureLogs?: boolean,
  parallelLimit?: number,
  groupName?: string,
}

const defaultLogAddFunction = (str: string) => {
  console.log(str);
};

const defaultSetProcessFunction = (all: number, success: number, failure: number) => {
  console.log(`load process: all: ${all} success: ${success} failure: ${failure}`);
};

export class DownloadService {
  constructor(
    private fs: IFileSystem,
    private zstd: IZstd,
    private image: IImage
  ) {}

  private wrapperLoadFunc(urls: string[],
                          loadOriginPic: PicLoadFunc,
                          options?: LoadAndSaveGroupOptions): PicLoadFunc {
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
  }

  public async loadAndSaveGroup(urls: string[],
                                loadOriginPic: PicLoadFunc,
                                rootDir: string,
                                options?: LoadAndSaveGroupOptions
  ) {
    if (!urls || urls.length == 0) {
      return;
    }

    const sep = this.fs.pathSep;
    const addLog = options?.addLog ?? defaultLogAddFunction;
    const setProcess = options?.setProcess ?? defaultSetProcessFunction;
    const all = urls.length;
    let success = 0;
    let failure = 0;
    const addSuccessLog = !(options?.onlyAddFailureLogs ?? false);

    const taskId: number = Date.now();
    const indexToFileName: (string | undefined)[] = [];
    const indexToSmallFileName: (string | undefined)[] = [];
    const dirPath = `${rootDir}${sep}${taskId}`;
    await this.fs.mkdirs(dirPath);

    const wrappedLoad = this.wrapperLoadFunc(urls, loadOriginPic, options);

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
        const compressed = await this.zstd.compress(buf);
        const uuid = this.zstd.randomUUID();

        const path = `${dirPath}${sep}${uuid}`;
        await this.fs.writeFile(path, compressed);
        addSuccessLog && addLog(`第${i + 1}张图片，完成原图写入`);

        const smallUUID = this.zstd.randomUUID();
        const compressedImage = await this.image.compressImage(buf);

        if (compressedImage) {
           // Ensure compressedImage is Uint8Array or string that zstd.compress accepts
           // IImage interface returns Uint8Array | undefined.
           const smallImg = await this.zstd.compress(compressedImage);
           const smallPath = `${dirPath}${sep}${smallUUID}`;
           await this.fs.writeFile(smallPath, smallImg);
           indexToSmallFileName[i] = smallUUID;
        }

        addSuccessLog && addLog(`第${i + 1}张图片，加载成功`);
        success++;
        indexToFileName[i] = uuid;
      } catch (err) {
        console.error(err);
        addLog(`第${i + 1}张图片，失败，已跳过`);
        failure++;
      }
      setProcess(all, success, failure);
    }


    const path = `${dirPath}${sep}meta.json`;
    const indexPath = `${rootDir}${sep}index.json`

    const meta: ProjectMeta = {
      indexToFileName,
      indexToSmallFileName,
      createdAt: taskId,
      name: options?.groupName ?? taskId.toString(),
      lastOpen: taskId
    };
    await this.fs.writeFile(path, JSON.stringify(meta));
    
    // Update index
    let index: ProjectIndexData[] = [];
    try {
        const indexContent = await this.fs.readFile(indexPath, 'utf-8');
        if (typeof indexContent === 'string') {
             index = JSON.parse(indexContent);
        } else if (indexContent instanceof Uint8Array) {
             const dec = new TextDecoder();
             index = JSON.parse(dec.decode(indexContent));
        }
    } catch (e) {
        // Ignore if index file doesn't exist or is invalid
    }
    
    index = [generateIndex([meta], rootDir, sep)[0], ...index]
    await this.fs.writeFile(indexPath, JSON.stringify(index))
    addLog(`全部文件加载成功`);
  }
}
