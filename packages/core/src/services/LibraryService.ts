import { IFileSystem } from '../interfaces';
import { ProjectIndexData, ProjectMeta } from '../types/data';

export class LibraryService {
  constructor(private fs: IFileSystem) {}

  async loadAllMetas(rootDir: string): Promise<ProjectMeta[]> {
    const metaPaths = await this.fs.getMetaPaths(rootDir);
    const metas: ProjectMeta[] = [];
    for (let metaPath of metaPaths) {
      const str = await this.fs.readFile(metaPath, 'utf-8');
      if (!str || typeof str !== 'string') {
        continue;
      }
      try {
        const meta: ProjectMeta = JSON.parse(str);
        metas.push(meta);
      } catch (e) {
        console.error(`Failed to parse meta at ${metaPath}`, e);
      }
    }
    metas.sort((a, b) => b.lastOpen - a.lastOpen);
    return metas;
  }
  
  async loadIndex(rootDir: string): Promise<ProjectIndexData[] | undefined> {
    const sep = this.fs.pathSep;
    const str = await this.fs.readFile(`${rootDir}${sep}index.json`, 'utf-8');
    if (str && typeof str === 'string') {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error(e);
        }
    }
    return undefined;
  }
  
  async saveIndex(index: ProjectIndexData[], rootDir: string) {
     const sep = this.fs.pathSep;
     await this.fs.writeFile(`${rootDir}${sep}index.json`, JSON.stringify(index));
  }
  
  async updateSingleMeta(md: ProjectMeta, rootDir: string) {
    const sep = this.fs.pathSep;
    const path = `${rootDir}${sep}${md.createdAt}${sep}meta.json`;
    await this.fs.writeFile(path, JSON.stringify(md));
  }
  
  async deleteSingleMeta(mdId: number, rootDir: string) {
    const sep = this.fs.pathSep;
    const path = `${rootDir}${sep}${mdId}`;
    await this.fs.deleteDir(path);
  }
}
