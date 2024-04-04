import React, { useState } from 'react';
import { Card, Dropdown, Modal, Tooltip, Typography } from '@mui/joy';
import EditableText from '../../components/EditableText';
import Image from '../../components/Image';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Person, VisibilityOff } from '@mui/icons-material';
import { metaFirstPicPath } from '../../utils/metaUtils';

export default (props: {
  md: ProjectMeta,
  updateMeta: (md: ProjectMeta, refreshList: boolean) => Promise<void>,
  selectMd: (md: ProjectMeta) => void
}) => {


  const { updateMeta, selectMd } = props;
  const [md, setMd] = useState<ProjectMeta>(props.md);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [editArtistModalOpen, setEditArtistModalOpen] = useState<boolean>(false);

  const updateName = async (name: string) => {
    md.name = name;
    await updateMeta(md, false);
    setMd({ ...md });
  };

  const updateArtist = async (artist: string) => {
    md.artist = artist;
    await updateMeta(md, false);
    setMd({ ...md });
  };

  const openContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation()
    if (contextMenu === null) {
      setContextMenu({
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6
      });
    } else {
      setContextMenu(null);
    }
  };

  return <Dropdown><Card sx={{ width: 160 }} key={`${md.createdAt}|${md.name}`}
                         onContextMenu={openContextMenu}

  >
    <div>
      <EditableText defaultValue={md.name} onSave={str => updateName(str)} />
      <Typography level='body-sm'>{new Date(md.createdAt).toLocaleString()}</Typography>
    </div>
    <div style={{ width: 160, display: 'flex', justifyContent: 'center' }}
         className='p-v-showbtn'
         onClick={async () => {
           selectMd(md);
           md.lastOpen = Date.now();
           await updateMeta(md, false);
         }}
    >
      <Image id={metaFirstPicPath(md)} fileType='dataUrl' height={228} width={160} />
    </div>
    <Modal open={editArtistModalOpen}
           sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
           onClose={() => setEditArtistModalOpen(false)}>
      <EditableText defaultValue={md.artist} onSave={str => {
        updateArtist(str)
        setEditArtistModalOpen(false)
      }} />
    </Modal>
  </Card>
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
      <MenuItem key='author'
      >
        <ListItemIcon>
          <Person />
        </ListItemIcon>
        <ListItemText>
            <div style={{display: 'flex', alignItems:'center'}}>作者：<EditableText defaultValue={md.artist} placeHolder='请输入作者' onSave={str => {
              updateArtist(str)
            }} /></div>

        </ListItemText>

      </MenuItem>
      <MenuItem key='desc' onClick={async () => {
        md.hide = !md.hide;
        await updateMeta(md, true);
      }}>
        <ListItemIcon>
          <VisibilityOff />
        </ListItemIcon>
        <ListItemText>{md.hide?'取消隐藏':'隐藏此项'}</ListItemText>
      </MenuItem>
    </Menu>
  </Dropdown>;
};
