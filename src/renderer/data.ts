import React, { ReactElement } from 'react';

export interface ProjectMeta {
  indexToFileName: string[],
  indexToSmallFileName: string[],
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
}

export const defaultViewerConfig = (): ViewerConfig => {
  return {
    grouping: 'none'
  };
};

export const normalizeViewerConfig = (json: any): ViewerConfig => {
  return {
    grouping: json.grouping ?? 'none'
  };
};
