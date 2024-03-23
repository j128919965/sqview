import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
//
// const fs = require('node:fs')
// const path = require('node:path')
const ZstdCodec = require('zstd-codec').ZstdCodec;

const compress = (data: Uint8Array | string): Promise<Uint8Array> => {
  return new Promise<Uint8Array>((resolve, reject) => {
    ZstdCodec.run((zstd: any) => {
      const streaming = new zstd.Streaming();
      if (typeof data === 'string') {
        data = new TextEncoder().encode(data);
      }
      resolve(streaming.compress(data, 9));
    });
  });

};
const decompress = (data: Uint8Array, dataType: 'blob' | 'string' = 'blob'): Promise<Uint8Array> => {
  return new Promise<Uint8Array>((resolve, reject) => {
    ZstdCodec.run((zstd: any) => {
      const streaming = new zstd.Streaming();
      const decompressed = streaming.decompress(data, undefined);
      resolve(decompressed);
    });
  });

};

const decompressToString = (data: Uint8Array): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    ZstdCodec.run((zstd: any) => {
      const streaming = new zstd.Streaming();
      resolve(new TextDecoder().decode(streaming.decompress(data, undefined)));
    });
  });

};


// 封装遍历目录的函数
function getSubFiles(directory: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const filePaths: string[] = [];

      files.forEach((file) => {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);

        if (stats.isFile()) {
          filePaths.push(file);
        }
      });

      resolve(filePaths);
    });
  });
}

const getMetaPathInCurrentPath = async (dirPath: string): Promise<string | undefined> => {
  return new Promise<string | undefined>((res, rej) => {
    fs.readdir(dirPath, (err, files) => {
      if (!err && files.indexOf('meta.json') >= 0) {
        res(path.join(dirPath, 'meta.json'));
      }
      res(undefined);
    });
  });

};

function getMetaPaths(directory: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const metas: string[] = [];

    fs.readdir(directory, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      for (let file of files) {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          const meta = await getMetaPathInCurrentPath(fullPath);
          if (meta) {
            metas.push(meta);
          }
        }
      }

      resolve(metas);
    });
  });
}


// 封装读取文件字节的函数
function readFileBytes(filePath: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function readFileAsString(filePath: string, encoding: BufferEncoding): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}


// 封装将字节写入文件的函数
function writeFileBytes(filePath: string, data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// 在主进程中注册 IPC 事件监听器
export function registerMainProcessListeners() {
  ipcMain.handle('getSubFiles', async (event, directory) => {
    try {
      return await getSubFiles(directory);
    } catch (error) {
      console.error('Failed to traverse directory:', error);
      throw error;
    }
  });

  ipcMain.handle('readFileBytes', async (event, filePath) => {
    try {
      return await readFileBytes(filePath);
    } catch (error) {
      console.error('Failed to read file bytes:', error);
      throw error;
    }
  });

  ipcMain.handle('writeFileBytes', async (event, { filePath, data }) => {
    try {
      await writeFileBytes(filePath, data);
    } catch (error) {
      console.error('Failed to write file bytes:', error);
      throw error;
    }
  });

  ipcMain.handle('compress', (e, buf) => {
    return compress(buf);
  });

  ipcMain.handle('decompress', (e, buf) => {
    return decompress(buf);
  });


  ipcMain.handle('getMetaPaths', (e, path) => {
    return getMetaPaths(path);
  });

  ipcMain.handle('mkdirs', (e, path) => {
    return new Promise((res, rej) => {
      fs.mkdir(path, { recursive: true }, () => res(true));
    });
  });

  ipcMain.handle('readFileAsString', (e, path, encoding) => {
    return readFileAsString(path, encoding);
  });

  ipcMain.handle('decompressToString', (e, data) => {
      return decompressToString(data)
  });
}
