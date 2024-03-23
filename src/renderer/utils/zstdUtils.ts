
export const compress = (data: Uint8Array | string): Promise<Uint8Array> => {
  return window.electron.ipcRenderer.invoke('compress', data);
};


export const decompress = (data: Uint8Array): Promise<Uint8Array> => {
  return window.electron.ipcRenderer.invoke('decompress', data);
};

export const decompressToString = (data: Uint8Array): Promise<string> => {
  return window.electron.ipcRenderer.invoke('decompressToString', data);
};

export const randomUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  })
}
