// 在渲染进程中调用 IPC 方法
import { timeout } from './timeout';
import { ViewerConfig } from '../data';

export function getSubFiles(
  directory: string
): Promise<string[]> {
  return timeout(5000, () => window.electron.ipcRenderer.invoke('getSubFiles', directory));
}

export async function readFileBytes(filePath: string): Promise<Uint8Array | undefined> {
  try {
    return await timeout(5000, () => window.electron.ipcRenderer.invoke('readFileBytes', filePath));
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

export async function readFileAsString(filePath: string, encoding: string): Promise<string | undefined> {
  return await timeout(5000, () => window.electron.ipcRenderer.invoke('readFileAsString', filePath, encoding));
}

export async function writeFileBytes(
  filePath: string,
  data: Uint8Array | string
): Promise<void> {
  const v = await timeout(5000, () => window.electron.ipcRenderer.invoke('writeFileBytes', {
    filePath,
    data
  }));
  console.log('write file to ' + filePath);
  return v;
}

export function mkdirs(path: string): Promise<void> {
  return timeout(5000, () => window.electron.ipcRenderer.invoke('mkdirs', path));
}

export function getMetaPaths(path: string): Promise<string[]> {
  return timeout(5000, () => window.electron.ipcRenderer.invoke('getMetaPaths', path));
}

export function getViewerConfig(path: string): Promise<ViewerConfig> {
  return timeout(5000, () => window.electron.ipcRenderer.invoke('getViewerConfig', path));
}

export function updateViewerConfig(path: string, vc: ViewerConfig): Promise<void> {
  return timeout(5000, () => window.electron.ipcRenderer.invoke('updateViewerConfig', path, vc));
}

export function chooseDirectory(): Promise<string | undefined> {
  return window.electron.ipcRenderer.invoke('chooseDirectory');
}

export function chooseZipAndReturnDirectory(rootDir: string): Promise<string | undefined> {
  return window.electron.ipcRenderer.invoke('chooseZipAndReturnDirectory', rootDir)
}

export function deleteDir(path: string) : Promise<void> {
  return timeout(2000, ()=>window.electron.ipcRenderer.invoke('deleteDir', path))
}
