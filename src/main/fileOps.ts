import { dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { defaultViewerConfig, normalizeViewerConfig, ViewerConfig } from '../renderer/data';
//
// const fs = require('node:fs')
// const path = require('node:path')
const ZstdCodec = require('zstd-codec').ZstdCodec;

const compress = (data: Uint8Array | string): Promise<Uint8Array> => {
  return new Promise<Uint8Array>((resolve) => {
    ZstdCodec.run((zstd: any) => {
      const streaming = new zstd.Streaming();
      if (typeof data === 'string') {
        data = new TextEncoder().encode(data);
      }
      resolve(streaming.compress(data, 9));
    });
  });

};
const decompress = (data: Uint8Array): Promise<Uint8Array> => {
  return new Promise<Uint8Array>((resolve) => {
    ZstdCodec.run((zstd: any) => {
      const streaming = new zstd.Streaming();
      const decompressed = streaming.decompress(data, undefined);
      resolve(decompressed);
    });
  });

};

const decompressToString = (data: Uint8Array): Promise<string> => {
  return new Promise<string>((resolve) => {
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
  return new Promise<string | undefined>((res) => {
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

function getViewerConfig(directory: string): Promise<ViewerConfig> {
  return new Promise<ViewerConfig>(res => {
    const realPath = path.join(directory, 'viewer.conf.json');
    if (fs.existsSync(realPath)) {
      fs.readFile(realPath, 'utf-8', (err, data) => {
        if (!err) {
          res(normalizeViewerConfig(JSON.parse(data)));
        } else {
          res(defaultViewerConfig());
        }
      });
    } else {
      res(defaultViewerConfig());
    }
  });
}

function updateViewerConfig(directory: string, vc: ViewerConfig): Promise<void> {
  return new Promise<void>(res => {
    const realPath = path.join(directory, 'viewer.conf.json');
    fs.writeFile(realPath, JSON.stringify(vc), (err) => {
      if (err) {
        console.error(err);
      } else {
        res();
      }
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
    fs.readFile(filePath, encoding, (err, data) => {
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

function chooseDirectory(): Promise<string | undefined> {
  return new Promise(res => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      if (!result.canceled) {
        res(result.filePaths[0]);
      } else {
        res(undefined);
      }
    }).catch(err => {
      console.error(err);
      res(undefined);
    });
  });
}

// 在主进程中注册 IPC 事件监听器
export function registerMainProcessListeners() {
  ipcMain.handle('getSubFiles', async (_, directory) => {
    try {
      return await getSubFiles(directory);
    } catch (error) {
      console.error('Failed to traverse directory:', error);
      throw error;
    }
  });

  ipcMain.handle('readFileBytes', async (_, filePath) => {
    try {
      return await readFileBytes(filePath);
    } catch (error) {
      console.error('Failed to read file bytes:', error);
      throw error;
    }
  });

  ipcMain.handle('writeFileBytes', async (_, { filePath, data }) => {
    try {
      await writeFileBytes(filePath, data);
    } catch (error) {
      console.error('Failed to write file bytes:', error);
      throw error;
    }
  });

  ipcMain.handle('compress', (_, buf) => {
    return compress(buf);
  });

  ipcMain.handle('decompress', (_, buf) => {
    return decompress(buf);
  });


  ipcMain.handle('getMetaPaths', (_, path) => {
    return getMetaPaths(path);
  });

  ipcMain.handle('mkdirs', (_, path) => {
    return new Promise((res) => {
      fs.mkdir(path, { recursive: true }, () => res(true));
    });
  });

  ipcMain.handle('readFileAsString', (_, path, encoding) => {
    return readFileAsString(path, encoding);
  });

  ipcMain.handle('decompressToString', (_, data) => {
    return decompressToString(data);
  });

  ipcMain.handle('getViewerConfig', (_, path) => {
    return getViewerConfig(path);
  });

  ipcMain.handle('updateViewerConfig', (_, path, vc) => {
    return updateViewerConfig(path, vc);
  });

  ipcMain.handle('chooseDirectory', () => {
    return chooseDirectory();
  });
}
