import { ReactElement } from 'react';

export * from '@sqview/core/dist/types/data';

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
