
export const compress = (data: Buffer): Promise<Buffer> => {
  return window.electron.ipcRenderer.invoke('compress', data);
};


export const decompress = (data: Buffer): Promise<Buffer> => {
  return window.electron.ipcRenderer.invoke('decompress', data);
};
