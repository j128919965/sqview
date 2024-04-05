import React, { ReactElement } from 'react';

interface ProjectMeta {
  indexToFileName: string[],
  indexToSmallFileName: string[],
  createdAt: number,
  name: string,
  lastOpen: number,
  artist?: string,
  tags?: string[],
  hide?: boolean
}

interface MenuItemData {
  icon?: ReactElement,
  onClick?: (e: React.MouseEvent) => void
  content: string | ReactElement
}

interface ViewerConfig {
  grouping: undefined | 'artist'
}
