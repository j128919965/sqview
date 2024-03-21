import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
//
// const fs = require('node:fs')
// const path = require('node:path')

// 封装遍历目录的函数
export function getSubDirs(directory: string): Promise<string[]> {
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

        if (stats.isDirectory()) {
          filePaths.push(file);
        }
      });

      resolve(filePaths);
    });
  });
}

// 封装读取文件字节的函数
export function readFileBytes(filePath: string): Promise<Buffer> {
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

// 封装将字节写入文件的函数
export function writeFileBytes(filePath: string, data: Buffer): Promise<void> {
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
  ipcMain.handle('getSubDirs', async (event, directory) => {
    try {
      return await getSubDirs(directory);
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
}
