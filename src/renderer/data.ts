import React, { ReactElement } from 'react';

export interface ProjectMeta {
  indexToFileName: (string | undefined)[],
  indexToSmallFileName: (string | undefined)[],
  createdAt: number,
  name: string,
  lastOpen: number,
  artist?: string,
  tags?: string[],
  hide?: boolean
}

export interface ProjectIndexData {
  previewImage?: string,
  createdAt: number,
  name: string,
  lastOpen: number,
  artist?: string,
  tags?: string[],
  hide?: boolean
}


export interface MenuItemData {
  icon?: ReactElement,
  onClick?: (e: React.MouseEvent) => void
  content: string | ReactElement,
  subMenus?: MenuItemData[]
  ignore?: boolean,
  notCloseAfterClick?: boolean
}

export interface MenuPosition {
  x: number,
  y: number
}

export interface ViewerConfig {
  grouping: 'none' | 'artist';
  dirShow: DirShow,
  hideMode: 'all' | 'hide' | 'onlyHide'
}

export const defaultViewerConfig = (): ViewerConfig => {
  return {
    grouping: 'none',
    dirShow: 'pic',
    hideMode: 'all'
  };
};

export const normalizeViewerConfig = (json: any): ViewerConfig => {
  return {
    grouping: json.grouping ?? 'none',
    dirShow: json.dirShow ?? 'pic',
    hideMode: json.hideMode ?? 'all'
  };
};

export type DirShow = 'id' | 'pic'

export const isDirShow = (str: string | null): str is DirShow => {
  if (!str) {
    return false;
  }
  return str == 'id' || str == 'pic'
}

export type FileType = 'blob' | 'dataUrl'

export type GlobalState = 'root_dir' | 'path_sep'

export interface OpenZipResult {
  originZipFile: string
  tempPath: string
}
