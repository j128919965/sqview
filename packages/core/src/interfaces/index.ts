export interface IFileSystem {
  readFile(path: string, encoding?: string): Promise<string | Uint8Array | undefined>;
  writeFile(path: string, data: string | Uint8Array): Promise<void>;
  mkdirs(path: string): Promise<void>;
  deleteDir(path: string): Promise<void>;
  getMetaPaths(rootDir: string): Promise<string[]>;
  pathSep: string;
}

export interface INetwork {
  sendRequest(url: string): Promise<Uint8Array | undefined>;
}

export interface IZstd {
  compress(data: Uint8Array | string): Promise<Uint8Array>;
  decompress(data: Uint8Array): Promise<Uint8Array>;
  randomUUID(): string;
}

export interface IImage {
  compressImage(data: Uint8Array): Promise<Uint8Array | undefined>;
}
