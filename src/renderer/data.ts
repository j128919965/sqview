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

export interface MenuItemData {
  icon?: ReactElement,
  onClick?: (e: React.MouseEvent) => void
  content: string | ReactElement
}

export interface ViewerConfig {
  grouping: 'none' | 'artist';
  dirShow: DirShow
}

export const defaultViewerConfig = (): ViewerConfig => {
  return {
    grouping: 'none',
    dirShow: 'pic'
  };
};

export const normalizeViewerConfig = (json: any): ViewerConfig => {
  return {
    grouping: json.grouping ?? 'none',
    dirShow: json.dirShow ?? 'pic'
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

export type GlobalState = 'root_dir'
