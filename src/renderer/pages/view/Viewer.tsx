import React, { useEffect, useRef, useState } from 'react';
import { getMetaPaths, readFileAsString, writeFileBytesRenderer } from '../../utils/fileUtils';
import '../Viewer.css';
import Toast from '../../components';
import { Stack } from '@mui/joy';
import DetailView from './DetailView';
import PreviewCard from './PreviewCard';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Person, VisibilityOff } from '@mui/icons-material';
import EditableText from '../../components/EditableText';

const loadMetas = async (): Promise<ProjectMeta[]> => {
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


export const Viewer = () => {

  const [metas, setMetas] = useState<ProjectMeta[]>([]);
  const [selectedMd, setSelectedMd] = useState<ProjectMeta>();
  const viewerRef = useRef<any>(null);
  const [seeHide, setSeeHide] = useState(false);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const loadPreviewList = async () => {
    try {
      const metas = await loadMetas();
      setMetas(metas);

    } catch (e: any) {
      console.error(e);
      Toast.error('加载失败 , ' + e.message);
    }
  };

  const updateMeta = async (md: ProjectMeta, refreshList: boolean) => {
    const path = `${window.globalState.root_dir}\\${md.createdAt}\\meta.json`;
    await writeFileBytesRenderer(path, JSON.stringify(md));
    metas.sort((a: ProjectMeta, b: ProjectMeta) => b.lastOpen - a.lastOpen);
    if (refreshList) {
      setMetas([...metas]);
    }
  };

  const openContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (contextMenu === null) {
      setContextMenu({
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6
      });
    } else {
      setContextMenu(null);
    }
  };

  useEffect(() => {
    const rootDir = window.globalState.root_dir;
    if (!rootDir) {
      window.electron.ipcRenderer.on('open_root_dir', () => loadPreviewList());
    } else {
      loadPreviewList();
    }

  }, []);

  return <div style={{height:'100vh'}} onContextMenu={openContextMenu}> {
    selectedMd ? <DetailView onCloseDetail={() => {
        setMetas([...metas]);
        setSelectedMd(undefined);
      }} md={selectedMd} /> :
      <Stack
        ref={viewerRef} spacing={2} direction='row' justifyContent='center' flexWrap='wrap'
             sx={{ overflowY: 'auto', maxHeight: '100vh' }} useFlexGap>
        {
          !metas ? <h1>预览加载中</h1> : metas
            .filter(md => seeHide ? md.hide : !md.hide)
            .map(md => <PreviewCard
              key={md.createdAt}
              md={md}
              selectMd={setSelectedMd}
              updateMeta={updateMeta}
            />)
        }
      </Stack>
  }
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
      <MenuItem key='desc' onClick={async () => {
        setSeeHide(!seeHide);
      }}>
        <ListItemIcon>
          <VisibilityOff />
        </ListItemIcon>
        <ListItemText>{seeHide ? '不显示隐藏项' : '仅显示隐藏项'}</ListItemText>
      </MenuItem>
    </Menu>
  </div>;
};
