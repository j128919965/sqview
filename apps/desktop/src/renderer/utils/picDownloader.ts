import { DownloadService, LoadAndSaveGroupOptions, PicLoadFunc } from '@sqview/core/dist/services/DownloadService';
import { SqPicUrlHelper } from '@sqview/core/dist/utils/sqPicUrlHelper';
import { ElectronFileSystem, ElectronZstd, ElectronImage } from '../services/implementations';

export { SqPicUrlHelper };
export type { PicLoadFunc, LoadAndSaveGroupOptions };

export const sendPicRequest = async (str: string): Promise<Uint8Array | undefined> => {
  return window.electron.ipcRenderer
    .invoke('sendPicRequest', str)
    .catch(err => {
      console.error(err);
      return undefined;
    });
};

export const loadAndSaveGroup = async (urls: string[],
                                       loadOriginPic: PicLoadFunc,
                                       options?: LoadAndSaveGroupOptions) => {
   const sep = window.globalState.path_sep;
   const root = window.globalState.root_dir;

   if (!sep || !root) throw new Error("Not initialized");

   const fs = new ElectronFileSystem(sep);
   const zstd = new ElectronZstd();
   const img = new ElectronImage();
   const service = new DownloadService(fs, zstd, img);

   return service.loadAndSaveGroup(urls, loadOriginPic, root, options);
}
