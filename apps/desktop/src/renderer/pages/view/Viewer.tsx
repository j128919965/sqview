import React, { useEffect, useRef, useState } from 'react';
import '../Viewer.css';
import Toast from '../../components';
import { Button, Chip, Divider, Stack } from '@mui/joy';
import DetailView from './DetailView';
import PreviewCard from './PreviewCard';
import { CheckCircleOutlined, Circle, Filter, VisibilityOff } from '@mui/icons-material';
import { defaultViewerConfig, DirShow, MenuItemData, ProjectIndexData, ProjectMeta, ViewerConfig } from '../../data';
import MenuContainer from '../../components/MenuContainer';
import TagFilter from '../../components/TagFilter';
import {
  deleteSingleMeta,
  generateIndex,
  grouping,
  loadAllMetas,
  loadIndex, saveIndex,
  updateSingleMeta
} from '../../utils/metaUtils';
import { getViewerConfig, updateViewerConfig } from '../../utils/fileUtils';


export const Viewer = () => {

  const [metas, setMetas] = useState<ProjectMeta[]>([]);
  const [selectedMd, setSelectedMd] = useState<ProjectMeta>();
  const viewerRef = useRef<any>(null);
  const [viewerConfig, _setViewerConfig] = useState<ViewerConfig>(defaultViewerConfig());
  const [loading, setLoading] = useState<boolean>(false);
  const [index, setIndex] = useState<ProjectIndexData[]>([]);
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);

  const findMeta = (mdId: number) : ProjectMeta | undefined => {
    for (let meta of metas) {
      if (meta.createdAt === mdId) {
        return meta
      }
    }
    return undefined
  }

  const selectMd = (idxData: ProjectIndexData) => {
    const meta = findMeta(idxData.createdAt);
    if (meta) {
      setSelectedMd(meta)
    }
  }

  const loadPreviewList = async () => {
    if (!window.globalState.root_dir) {
      Toast.error('未选择根目录');
      return;
    }

    try {
      setLoading(true);
      const preLoadIndex = await loadIndex();
      if (preLoadIndex) {
        setIndex(preLoadIndex)
        setLoading(false)
        loadAllMetas().then(mds => setMetas(mds))
      } else {
        const metas = await loadAllMetas();
        setMetas(metas);
        const generatedIndex = generateIndex(metas)
        setIndex(generatedIndex)
        setLoading(false)
        saveIndex(generatedIndex)
      }

    } catch (e: any) {
      console.error(e);
      Toast.error('加载失败 , ' + e.message);
    }
    setLoading(false);
  };

  const loadViewConfig = async () => {
    const rootDir = window.globalState.root_dir;
    if (!rootDir) {
      throw new Error('root dir not choosed');
    }
    const vc = await getViewerConfig(rootDir);
    console.log(vc);
    _setViewerConfig(vc);
  };

  // 根据标签分组
  const groupByTags = (arr: ProjectIndexData[], valueFilter?: (obj: ProjectIndexData) => boolean): {key: string, data: ProjectIndexData[]}[] => {
    const result: Record<string, ProjectIndexData[]> = {};
    
    arr.forEach(element => {
      if (valueFilter && !valueFilter(element)) {
        return;
      }
      
      const tags = element.tags || [];
      if (tags.length === 0) {
        // 没有标签的项目归类到"未分类"
        if (!result['未分类']) {
          result['未分类'] = [];
        }
        result['未分类'].push(element);
      } else {
        // 有标签的项目，每个标签都创建一个分组
        tags.forEach(tag => {
          if (!result[tag]) {
            result[tag] = [];
          }
          result[tag].push(element);
        });
      }
    });

    return Object.keys(result)
      .sort()
      .map(key => ({
        key,
        data: result[key]
      }));
  };

  // 获取所有可用标签
  const getAllTags = (): string[] => {
    const allTags = new Set<string>();
    index.forEach(md => {
      if (md.tags) {
        md.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  const setViewerConfig = async (vc: ViewerConfig) => {
    const _vc = { ...vc };
    _setViewerConfig(_vc);
    if (!window.globalState.root_dir) {
      Toast.error('根目录未选择，无法保存配置');
      return;
    }
    await updateViewerConfig(window.globalState.root_dir, _vc);
  };

  const updateMeta = async (idxData: ProjectIndexData, refreshList: boolean) => {
    const meta = findMeta(idxData.createdAt);
    if (!meta) {
      return
    }
    meta.hide = idxData.hide;
    meta.artist = idxData.artist;
    meta.tags = idxData.tags;
    meta.lastOpen = idxData.lastOpen;
    meta.name = idxData.name;
    await updateSingleMeta(meta);
    metas.sort((a: ProjectMeta, b: ProjectMeta) => b.lastOpen - a.lastOpen);

    const newMetas = [...metas];
    const newIndex = generateIndex(newMetas);
    saveIndex(newIndex)

    if (refreshList) {
      setMetas(newMetas);
      setIndex(newIndex)
    }
  };

  const deleteMeta = async (md: ProjectIndexData) => {
    const mdId = md.createdAt;
    await deleteSingleMeta(mdId);
    const newMetas = metas.filter(m => m.createdAt !== mdId);
    setMetas(newMetas);
    const newIndex = generateIndex(newMetas)
    setIndex(newIndex)
    saveIndex(newIndex)
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
    const list = (metaList: ProjectIndexData[]) => {
      // 应用筛选
      const filteredList = metaList.filter(filterMeta);
      
      return <Stack
        ref={viewerRef} spacing={2} direction='row' justifyContent='center' flexWrap='wrap' useFlexGap>
        {
          !filteredList ? <h1>预览加载中</h1> :
            filteredList.map(md => <PreviewCard
              key={md.createdAt}
              md={md}
              selectMd={selectMd}
              updateMeta={updateMeta}
              deleteMd={deleteMeta}
              allTags={getAllTags()}
            />)
        }
      </Stack>;
    };

    const filterMetaByHide = (md: ProjectIndexData): boolean => {
      if (!viewerConfig) {
        return true;
      }
      if (viewerConfig.hideMode === 'all') {
        return true;
      }
      if (viewerConfig.hideMode === 'hide') {
        return !md.hide;
      }
      if (viewerConfig.hideMode === 'onlyHide') {
        return !!md.hide;
      }
      return false;
    };

    // 根据标签筛选
    const filterMetaByTags = (md: ProjectIndexData): boolean => {
      if (selectedTagsFilter.length === 0) {
        return true;
      }
      if (!md.tags || md.tags.length === 0) {
        return false;
      }
      // 检查是否包含任一选中的标签
      return selectedTagsFilter.some(tag => md.tags!.includes(tag));
    };

    // 综合筛选函数
    const filterMeta = (md: ProjectIndexData): boolean => {
      return filterMetaByHide(md) && filterMetaByTags(md);
    };


    return <MenuContainer style={{ height: '100vh', overflowY: 'auto' }} menu={menu}>
      <TagFilter
        availableTags={getAllTags()}
        selectedTags={selectedTagsFilter}
        onTagsChange={setSelectedTagsFilter}
      />
      {viewerConfig.grouping === 'none'
        ? list(index)
        : viewerConfig.grouping === 'artist'
        ? <>{
          grouping(index, (md) => md.artist ?? '未填写作者', filterMeta)
            .map(d => {
              return <>
                <Divider sx={{ margin: '10px 0' }} key={d.key}>
                  <Chip variant='soft' color='neutral' size='lg'>
                    {d.key}
                  </Chip>
                </Divider>
                {list(d.data)}
              </>;
            })
        }</>
        : viewerConfig.grouping === 'tags'
        ? <>{
          groupByTags(index, filterMeta)
            .map(d => {
              return <>
                <Divider sx={{ margin: '10px 0' }} key={d.key}>
                  <Chip variant='soft' color='primary' size='lg'>
                    {d.key}
                  </Chip>
                </Divider>
                {list(d.data)}
              </>;
            })
        }</>
        : null
      }
    </MenuContainer>;
  }

  function showDetail() {
    return <DetailView
      onChangeDirShow={(dirShow: DirShow) => setViewerConfig({ ...viewerConfig, dirShow })}
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
      content: '筛选隐藏',
      subMenus: [
        {
          icon: viewerConfig?.hideMode === 'all' ? <CheckCircleOutlined /> : <Circle />,
          content: '全部显示',
          onClick: () => setViewerConfig({ ...viewerConfig, hideMode: 'all' })
        },
        {
          icon: viewerConfig?.hideMode === 'hide' ? <CheckCircleOutlined /> : <Circle />,
          content: '不显示隐藏',
          onClick: () => setViewerConfig({ ...viewerConfig, hideMode: 'hide' })
        },
        {
          icon: viewerConfig?.hideMode === 'onlyHide' ? <CheckCircleOutlined /> : <Circle />,
          content: '仅显示隐藏',
          onClick: () => setViewerConfig({ ...viewerConfig, hideMode: 'onlyHide' })
        }
      ]
    },
    {
      content: `分组方式`,
      icon: <Filter />,
      subMenus: [
        {
          icon: viewerConfig?.grouping === 'none' ? <CheckCircleOutlined /> : <Circle />,
          content: '不分组',
          onClick: () => setViewerConfig({ ...viewerConfig, grouping: 'none' })
        },
        {
          icon: viewerConfig?.grouping === 'artist' ? <CheckCircleOutlined /> : <Circle />,
          content: '按照作者分组',
          onClick: () => setViewerConfig({ ...viewerConfig, grouping: 'artist' })
        },
        {
          icon: viewerConfig?.grouping === 'tags' ? <CheckCircleOutlined /> : <Circle />,
          content: '按照标签分组',
          onClick: () => setViewerConfig({ ...viewerConfig, grouping: 'tags' })
        }
      ]
    }
  ];

  return <div style={{ height: '100vh' }}>
    {
      loading ?
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          加载中
          <Button loading variant='plain' />
        </div> : selectedMd ? showDetail() : showPreviewList()
    }
  </div>;
};
