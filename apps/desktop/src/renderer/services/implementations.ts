import { IFileSystem, IZstd, IImage } from '@sqview/core/dist/interfaces';
import { readFileAsString, readFileBytes, writeFileBytes, mkdirs, deleteDir, getMetaPaths } from '../utils/fileUtils';
import { compress, decompress, randomUUID } from '../utils/zstdUtils';
import { compressImage } from '../utils/imgUtils';

export class ElectronFileSystem implements IFileSystem {
  pathSep: string;

  constructor(pathSep: string) {
    this.pathSep = pathSep;
  }

  async readFile(path: string, encoding?: string): Promise<string | Uint8Array | undefined> {
    if (encoding) {
      return readFileAsString(path, encoding);
    }
    return readFileBytes(path);
  }

  async writeFile(path: string, data: string | Uint8Array): Promise<void> {
    return writeFileBytes(path, data);
  }

  async mkdirs(path: string): Promise<void> {
    return mkdirs(path);
  }

  async deleteDir(path: string): Promise<void> {
    return deleteDir(path);
  }

  async getMetaPaths(rootDir: string): Promise<string[]>;
  async getMetaPaths(rootDir: string): Promise<string[]> {
    return getMetaPaths(rootDir);
  }
}

export class ElectronZstd implements IZstd {
  async compress(data: Uint8Array | string): Promise<Uint8Array> {
    return compress(data);
  }

  async decompress(data: Uint8Array): Promise<Uint8Array> {
    return decompress(data);
  }

  randomUUID(): string {
    return randomUUID();
  }
}

export class ElectronImage implements IImage {
  async compressImage(data: Uint8Array): Promise<Uint8Array | undefined> {
    const dataUrl = await compressImage(data);
    if (!dataUrl) return undefined;

    // Convert DataURL to Uint8Array
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr;
  }
}
