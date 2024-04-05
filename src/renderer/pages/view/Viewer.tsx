import React, { useEffect, useRef, useState } from 'react';
import '../Viewer.css';
import Toast from '../../components';
import { Stack } from '@mui/joy';
import DetailView from './DetailView';
import PreviewCard from './PreviewCard';
import { VisibilityOff } from '@mui/icons-material';
import { MenuItemData, ProjectMeta } from '../../data';
import MenuContainer from '../../components/MenuContainer';
import { loadAllMetas, updateSingleMeta } from '../../utils/metaUtils';


export const Viewer = () => {

  const [metas, setMetas] = useState<ProjectMeta[]>([]);
  const [selectedMd, setSelectedMd] = useState<ProjectMeta>();
  const viewerRef = useRef<any>(null);
  const [seeHide, setSeeHide] = useState(false);

  const menu: MenuItemData[] = [
    {
      icon: <VisibilityOff />,
      content: seeHide ? '不显示隐藏项' : '仅显示隐藏项',
      onClick: () => setSeeHide(!seeHide)
    }
  ];

  const loadPreviewList = async () => {
    try {
      const metas = await loadAllMetas();
      setMetas(metas);
    } catch (e: any) {
      console.error(e);
      Toast.error('加载失败 , ' + e.message);
    }
  };

  const updateMeta = async (md: ProjectMeta, refreshList: boolean) => {
    await updateSingleMeta(md);
    metas.sort((a: ProjectMeta, b: ProjectMeta) => b.lastOpen - a.lastOpen);
    if (refreshList) {
      setMetas([...metas]);
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

  function showPreviewList() {
    return <MenuContainer style={{ height: '100vh' }} menu={menu}>
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
    </MenuContainer>;
  }

  function showDetail() {
    return <DetailView onCloseDetail={() => {
      setMetas([...metas]);
      setSelectedMd(undefined);
    }} md={selectedMd!!} />;
  }

  return <div style={{ height: '100vh' }}>
    {
      selectedMd ? showDetail() : showPreviewList()
    }
  </div>;
};
