import { dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { defaultViewerConfig, normalizeViewerConfig, OpenZipResult, ViewerConfig } from '../renderer/data';
const AdmZip = require("adm-zip");
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

function readFileAsString(filePath: string, encoding: BufferEncoding): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    fs.exists(filePath, (exists) => {
      if (!exists) {
        resolve(undefined)
        return
      }
      fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
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

async function unzipFileToTempDir(rootDir: string, zipFilePath: string): Promise<string> {
  // 创建一个临时目录

  const tempDirPath= rootDir +path.sep +'temp'+ new Date().getTime();

  fs.mkdirSync(tempDirPath);

  fs.chmodSync(tempDirPath, '777')

  // 读取ZIP文件并解压到临时目录
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(tempDirPath)

  // 删除ZIP文件
  fs.unlinkSync(zipFilePath);

  // 返回临时目录路径
  return tempDirPath;
}

function deleteDir(path: string): Promise<void> {
  return new Promise<void>((res) => {
    fs.rm(path, { recursive: true, force: true }, (e) => {
      if (e) {
        console.error(e);
      }
      res();
    });
  });
}


function chooseZipAndReturnDirectory(rootDir: string): Promise<OpenZipResult | undefined> {
  return new Promise<OpenZipResult | undefined>(res => {
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{
        extensions: ['zip'],
        name: ''
      }]
    }).then(async result => {
      if (!result.canceled) {
        const filePath = result.filePaths[0];
        const temp = await unzipFileToTempDir(rootDir,filePath);
        console.log(temp);
        res({tempPath: temp, originZipFile: filePath});
      } else {
        res(undefined);
      }
    }).catch(err => {
      console.error(err);
      res(undefined);
    });
  })
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

  ipcMain.handle('chooseZipAndReturnDirectory', (_, rootDir)=>{
    return chooseZipAndReturnDirectory(rootDir)
  })

  ipcMain.handle('deleteDir', (_, path) => {
    return deleteDir(path);
  });
  ipcMain.handle('joinPath', (_, paths) => {
    return path.join(paths);
  });
  ipcMain.handle('getPathSep', (_, paths) => {
    return path.sep
  });
}
