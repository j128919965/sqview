// 在渲染进程中调用 IPC 方法
export function getSubDirs(
  directory: string,
): Promise<string[]> {
  return window.electron.ipcRenderer.invoke('getSubDirs', directory);
}

export function readFileBytesRenderer(filePath: string): Promise<Buffer> {
  return window.electron.ipcRenderer.invoke('readFileBytes', filePath);
}

export function writeFileBytesRenderer(
  filePath: string,
  data: Buffer,
): Promise<void> {
  return window.electron.ipcRenderer.invoke('writeFileBytes', {
    filePath,
    data,
  });
}
