import React, { useEffect, useRef, useState } from 'react';
import '../Viewer.css';
import Toast from '../../components';
import { Chip, Divider, Stack } from '@mui/joy';
import DetailView from './DetailView';
import PreviewCard from './PreviewCard';
import { Filter, VisibilityOff } from '@mui/icons-material';
import { defaultViewerConfig, DirShow, MenuItemData, ProjectMeta, ViewerConfig } from '../../data';
import MenuContainer from '../../components/MenuContainer';
import { grouping, loadAllMetas, updateSingleMeta } from '../../utils/metaUtils';
import { getViewerConfig, updateViewerConfig } from '../../utils/fileUtils';


export const Viewer = () => {

  const [metas, setMetas] = useState<ProjectMeta[]>([]);
  const [selectedMd, setSelectedMd] = useState<ProjectMeta>();
  const viewerRef = useRef<any>(null);
  const [seeHide, setSeeHide] = useState(false);
  const [viewerConfig, _setViewerConfig] = useState<ViewerConfig>(defaultViewerConfig());
  const loadPreviewList = async () => {
    try {
      const metas = await loadAllMetas();
      setMetas(metas);
    } catch (e: any) {
      console.error(e);
      Toast.error('加载失败 , ' + e.message);
    }
  };

  const loadViewConfig = async () => {
    const rootDir = window.globalState.root_dir;
    if (!rootDir) {
      throw new Error('root dir not choosed');
    }
    const vc = await getViewerConfig(rootDir);
    console.log(vc)
    _setViewerConfig(vc);
  };

  const setViewerConfig = async (vc: ViewerConfig) => {
    const _vc = { ...vc };
    _setViewerConfig(_vc);
    await updateViewerConfig(window.globalState.root_dir, _vc);
  };

  const nextGroupingType = async () => {
    if (viewerConfig.grouping === 'none') {
      viewerConfig.grouping = 'artist';
    } else {
      viewerConfig.grouping = 'none';
    }
    await setViewerConfig(viewerConfig);
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
      window.electron.ipcRenderer.on('open_root_dir', () => {
        loadPreviewList();
        loadViewConfig();
      });
    } else {
      loadPreviewList();
      loadViewConfig();
    }
  }, []);

  function showPreviewList() {
    const list = (metaList: ProjectMeta[]) => {
      return <Stack
        ref={viewerRef} spacing={2} direction='row' justifyContent='center' flexWrap='wrap' useFlexGap>
        {
          !metaList ? <h1>预览加载中</h1> : metaList
            .filter(md => seeHide ? md.hide : !md.hide)
            .map(md => <PreviewCard
              key={md.createdAt}
              md={md}
              selectMd={setSelectedMd}
              updateMeta={updateMeta}
            />)
        }
      </Stack>;
    };


    return <MenuContainer style={{ height: '100vh', overflowY: 'auto' }} menu={menu}>
      {viewerConfig.grouping === 'none'
        ? list(metas)
        : <>{
          grouping(metas, (md) => md.artist ?? '未填写作者')
            .map(d => {
              return <>
                <Divider sx={{margin: '10px 0'}}>
                  <Chip variant="soft" color="neutral" size="lg">
                    {d.key}
                  </Chip>
                </Divider>
                {list(d.data)}
              </>;
            })
        }</>
      }
    </MenuContainer>;
  }

  function showDetail() {
    return <DetailView
      onChangeDirShow={(dirShow: DirShow)=> setViewerConfig({...viewerConfig, dirShow})}
      defaultDirShow={viewerConfig.dirShow}
      onCloseDetail={() => {
        setMetas([...metas]);
        setSelectedMd(undefined);
      }}
      md={selectedMd!!} />;
  }


  const menu: MenuItemData[] = [
    {
      icon: <VisibilityOff />,
      content: seeHide ? '不显示隐藏项' : '仅显示隐藏项',
      onClick: () => setSeeHide(!seeHide)
    },
    {
      content: `筛选方式：${viewerConfig?.grouping == 'none' ? '不筛选' : '按照作者筛选'}`,
      onClick: () => nextGroupingType(),
      icon: <Filter />
    }
  ];

  return <div style={{ height: '100vh' }}>
    {
      selectedMd ? showDetail() : showPreviewList()
    }
  </div>;
};
