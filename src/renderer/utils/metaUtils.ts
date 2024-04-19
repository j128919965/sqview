import { ProjectMeta } from '../data';
import { getMetaPaths, readFileAsString, writeFileBytes } from './fileUtils';
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

export const updateSingleMeta = async (md: ProjectMeta) => {
  const path = `${window.globalState.root_dir}\\${md.createdAt}\\meta.json`;
  await writeFileBytes(path, JSON.stringify(md));
};

export const grouping = <T>(arr: T[], keyFunc: (element: T) => string): {key: string, data: T[]}[] => {
  const result: Record<string, T[]> = {}

  arr.forEach(element => {
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
