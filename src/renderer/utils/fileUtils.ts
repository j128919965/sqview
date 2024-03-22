// 在渲染进程中调用 IPC 方法
export function getSubDirs(
  directory: string
): Promise<string[]> {
  return window.electron.ipcRenderer.invoke('getSubDirs', directory);
}

export async function readFileBytes(filePath: string): Promise<Buffer | undefined> {
  try {
    return await window.electron.ipcRenderer.invoke('readFileBytes', filePath);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

export function writeFileBytesRenderer(
  filePath: string,
  data: Buffer | string
): Promise<void> {
  return window.electron.ipcRenderer.invoke('writeFileBytes', {
    filePath,
    data
  }).then(v => console.log("write file to " + filePath))
}

export function mkdirs(path: string): Promise<void> {
  return window.electron.ipcRenderer.invoke('mkdirs', path)
}
