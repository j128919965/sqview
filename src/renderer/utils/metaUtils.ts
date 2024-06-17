import { ProjectIndexData, ProjectMeta } from '../data';
import { deleteDir, getMetaPaths, readFileAsString, writeFileBytes } from './fileUtils';
import { isValidString } from './stringUtils';

export const metaFirstPicPath = (meta: ProjectMeta) => {
  for (let smallPic of meta.indexToSmallFileName) {
    if (isValidString(smallPic)) {
      return `${window.globalState.root_dir}\\${meta.createdAt}\\${smallPic}`;
    }
  }
  return undefined;
};
export const loadAllMetas = async (): Promise<ProjectMeta[]> => {
  const rootDir = window.globalState.root_dir;
  if (!rootDir) {
    throw new Error('root dir not choosed');
  }
  const metaPaths = await getMetaPaths(rootDir);

  const metas: ProjectMeta[] = [];
  for (let metaPath of metaPaths) {
    const str = await readFileAsString(metaPath, 'utf-8');
    if (!str) {
      continue;
    }
    const meta: ProjectMeta = JSON.parse(str);
    metas.push(meta);
  }

  metas.sort((a: ProjectMeta, b: ProjectMeta) => b.lastOpen - a.lastOpen);
  return metas;
};

export const loadIndex = async (): Promise<ProjectIndexData[] | undefined> => {
  const rootDir = window.globalState.root_dir;
  if (!rootDir) {
    throw new Error('root dir not choosed');
  }
  const str = await readFileAsString(`${rootDir}\\index.json`, 'utf-8')
  if (str) {
    return JSON.parse(str)
  }
  return undefined;
}

export const generateIndex = (mdList: ProjectMeta[]) : ProjectIndexData[] => {
  return mdList.map(md => {
    return {
      createdAt: md.createdAt,
      previewImage: metaFirstPicPath(md),
      name: md.name,
      lastOpen: md.lastOpen,
      artist: md.artist,
      tags: md.tags,
      hide: md.hide
    }
  })
}

export const saveIndex = async (index: ProjectIndexData[]) => {
  const rootDir = window.globalState.root_dir;
  if (!rootDir) {
    throw new Error('root dir not choosed');
  }
  await writeFileBytes(`${rootDir}\\index.json`, JSON.stringify(index));
};

export const updateSingleMeta = async (md: ProjectMeta) => {
  const path = `${window.globalState.root_dir}\\${md.createdAt}\\meta.json`;
  await writeFileBytes(path, JSON.stringify(md));
};

export const deleteSingleMeta = async (mdId: number) => {
  const path = `${window.globalState.root_dir}\\${mdId}`;
  await deleteDir(path);
}

export const grouping = <T>(arr: T[], keyFunc: (element: T) => string, valueFilter?: (obj: T)=>boolean): {key: string, data: T[]}[] => {
  const result: Record<string, T[]> = {}

  arr.forEach(element => {
    if (valueFilter && !valueFilter(element)) {
      return;
    }
    const key = keyFunc(element);
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(element)
  })

  return Object.keys(result).map(key => {
    return {
      key,
      data: result[key]
    }
  })
};
