import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { MenuItemData, MenuPosition } from '../data';

const RecursiveMenu = (props: { menu: MenuItemData[], menuPosition?: MenuPosition, onClose?: () => void }) => {
  const { menu, menuPosition } = props;

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const [subMenuPosition, setSubMenuPosition] = useState<MenuPosition>();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!menuPosition) {
      setContextMenu(null);
    } else {
      setContextMenu({
        mouseX: menuPosition.x,
        mouseY: menuPosition.y
      });
    }
  }, [menuPosition]);


  function getOnClick(item: MenuItemData, index: number) {
    return !item.subMenus ? item.onClick : (e: React.MouseEvent) => {
      setSelectedIndex(index);
      if (subMenuPosition) {
        setSubMenuPosition(undefined)
      } else {
        setSubMenuPosition({ x: e.clientX + 2, y: e.clientY - 6 });
      }
      if (item.onClick) {
        item.onClick(e);
      }
    };
  }

  function getContent(item: MenuItemData, index: number) {
    if (item.subMenus) {
      return <div>
        <div>{item.content}</div>
        <RecursiveMenu menu={item.subMenus}
                       menuPosition={index == selectedIndex ? subMenuPosition : undefined}
                       onClose={() => setSubMenuPosition(undefined)} />
      </div>;
    }
    return <ListItemText>{item.content}</ListItemText>;
  }

  return <Menu
    open={contextMenu != null}
    onClose={() => {
      setContextMenu(null);
      if (props.onClose) {
        props.onClose();
      }
    }}
    anchorReference='anchorPosition'
    anchorPosition={
      contextMenu !== null
        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
        : undefined
    }
  >
    {
      menu.map((item, index) => <MenuItem
        key={index}
        onClick={getOnClick(item, index)}>
        {item.icon ? <ListItemIcon>
          {item.icon}
        </ListItemIcon> : <></>}
        {getContent(item, index)}
      </MenuItem>)
    }
  </Menu>;
};

export default (props: { menu: MenuItemData[], children: ReactElement, style?: CSSProperties, className?: string }) => {
  const { children, style } = props;

  const [menuPosition, setMenuPosition] = useState<MenuPosition | undefined>();

  const openContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPosition({
      x: event.clientX + 2,
      y: event.clientY - 6
    });
  };


  return <div style={{ cursor: 'context-menu', ...style }} className={props.className} onContextMenu={openContextMenu}>
    {children}
    <RecursiveMenu menu={props.menu} menuPosition={menuPosition} onClose={() => setMenuPosition(undefined)} />
  </div>;


}
