import { ProjectIndexData, ProjectMeta } from '../types/data';
import { isValidString } from './stringUtils';

export const metaFirstPicPath = (meta: ProjectMeta, rootDir: string, pathSep: string) => {
  for (let smallPic of meta.indexToSmallFileName) {
    if (isValidString(smallPic)) {
      return `${rootDir}${pathSep}${meta.createdAt}${pathSep}${smallPic}`;
    }
  }
  return undefined;
};

export const generateIndex = (mdList: ProjectMeta[], rootDir: string, pathSep: string) : ProjectIndexData[] => {
  return mdList.map(md => {
    return {
      createdAt: md.createdAt,
      previewImage: metaFirstPicPath(md, rootDir, pathSep),
      name: md.name,
      lastOpen: md.lastOpen,
      artist: md.artist,
      tags: md.tags,
      hide: md.hide
    }
  })
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
