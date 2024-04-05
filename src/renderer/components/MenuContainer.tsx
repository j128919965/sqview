import React, { CSSProperties, ReactElement } from 'react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { MenuItemData } from '../data';


export default (props: { menu: MenuItemData[], children: ReactElement, style?: CSSProperties, className?: string }) => {
  const { menu, children, style } = props;

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const openContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (contextMenu === null) {
      setContextMenu({
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6
      });
    } else {
      setContextMenu(null);
    }
  };

  return <div style={{ cursor: 'context-menu', ...style }} className={props.className} onContextMenu={openContextMenu}>
    {children}
    <Menu
      open={contextMenu != null}
      onClose={() => setContextMenu(null)}
      anchorReference='anchorPosition'
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      {
        menu.map((item, index) => <MenuItem key={index} onClick={item.onClick}>
          {item.icon ? <ListItemIcon>
            {item.icon}
          </ListItemIcon> : <></>}
          <ListItemText>{item.content}</ListItemText>
        </MenuItem>)
      }
    </Menu>
  </div>;


}
