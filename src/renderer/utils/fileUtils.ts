// 在渲染进程中调用 IPC 方法
export function getSubDirs(
  directory: string
): Promise<string[]> {
  return window.electron.ipcRenderer.invoke('getSubDirs', directory);
}

export async function readFileBytes(filePath: string): Promise<Uint8Array | undefined> {
  try {
    return await window.electron.ipcRenderer.invoke('readFileBytes', filePath);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

export async function readFileAsString(filePath: string, encoding: string): Promise<string | undefined> {
  return await window.electron.ipcRenderer.invoke("readFileAsString", filePath, encoding);
}

export async function writeFileBytesRenderer(
  filePath: string,
  data: Uint8Array | string
): Promise<void> {
  const v = await window.electron.ipcRenderer.invoke('writeFileBytes', {
    filePath,
    data
  });
  console.log('write file to ' + filePath);
  return v;
}

export function mkdirs(path: string): Promise<void> {
  return window.electron.ipcRenderer.invoke('mkdirs', path);
}

export function getMetaPaths(path: string): Promise<string[]> {
  return window.electron.ipcRenderer.invoke('getMetaPaths', path);
}
