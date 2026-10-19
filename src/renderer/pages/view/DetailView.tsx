import Image from '../../components/Image';
import React, { useEffect, useState } from 'react';
import { Button, Option, Select, Stack, ToggleButtonGroup } from '@mui/joy';
import { ArrowDropDown, ViewCarousel, ViewList } from '@mui/icons-material';
import { DirShow, isDirShow, ProjectMeta } from '../../data';
import { isValidString } from '../../utils/stringUtils';

const idToPath = (meta: ProjectMeta,id: string|undefined) => {
  if (isValidString(id)) {
    return `${window.globalState.root_dir}${window.globalState.path_sep}${meta.createdAt}${window.globalState.path_sep}${id}`;
  } else {
    return undefined;
  }
}

const metaPicPaths = (meta: ProjectMeta) => {
  return meta.indexToFileName.map(id => idToPath(meta, id));
};

const metaSmallPicPaths = (meta: ProjectMeta): (string | undefined)[] => {
  return meta.indexToSmallFileName.map(id => idToPath(meta, id));
};

// 修改视图模式类型
type ViewMode = 'single' | 'list';

export default (props: {
  md: ProjectMeta,
  defaultDirShow: DirShow
  onCloseDetail: () => void,
  onChangeDirShow: (dirShow: DirShow) => void
}) => {
  const { md, onCloseDetail, defaultDirShow, onChangeDirShow } = props;
  const paths = metaPicPaths(md);
  const [index, setIndexOrigin] = useState(0);
  const [dirShow, setDirShow] = useState<DirShow>(defaultDirShow);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [prevTitle] = useState<string>(document.title);

  // 统一的 setIndex 方法
  const setIndex = (idx: number) => {
    setIndexOrigin(idx);
    document.getElementById(`detail-index-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
    document.title = `第 ${idx + 1} / ${paths.length} 页`;

    // 在列表模式下，确保目标图片在可视范围内
    if (viewMode === 'list') {
      const element = document.getElementById(`list-item-${idx}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // 如果目标不在当前可视范围，调整可视范围
        const newStart = Math.floor(idx / 20) * 20;
        setVisibleRange({
          start: newStart,
          end: Math.min(newStart + 20, paths.length)
        });
        // 等待DOM更新后再滚动
        setTimeout(() => {
          document.getElementById(`list-item-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  useEffect(() => {
    setIndex(0);
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // 统一的滚动处理
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode === 'list') return
    e.preventDefault();
    if (e.deltaY < 0) {
      setIndex(Math.max(0, index - 1));
    } else {
      setIndex(Math.min(paths.length - 1, index + 1));
    }
  };

  // 处理列表视图的滚动
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (viewMode !== 'list') return;

    const element = e.currentTarget;

    // 处理懒加载 - 向下滚动
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 200) {
      setVisibleRange(prev => ({
        start: prev.start,
        end: Math.min(prev.end + 20, paths.length)
      }));
    }

    // 处理懒加载 - 向上滚动
    if (element.scrollTop < 200) {
      setVisibleRange(prev => ({
        start: Math.max(0, prev.start - 20),
        end: prev.end
      }));
    }

    // 处理导航联动
    const items = element.getElementsByClassName('p-d-list-item');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rect = item.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
        const newIndex = visibleRange.start + i;
        if (newIndex !== index) {
          setIndexOrigin(newIndex); // 使用 setIndexOrigin 避免重复滚动
          document.title = `第 ${newIndex + 1} / ${paths.length} 页`;
          document.getElementById(`detail-index-${newIndex}`)?.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      }
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX < halfWidth) {
      setIndex(Math.max(0, index - 1)); // 向前一页
    } else {
      setIndex(Math.min(paths.length - 1, index + 1)); // 向后一页
    }
  };

  // 修改列表视图渲染函数
  const listView = () => (
    <div className='p-d-list-container'>
      {paths.slice(visibleRange.start, visibleRange.end).map((path, i) => (
        <div
          key={i}
          id={`list-item-${visibleRange.start + i}`}
          className='p-d-list-item'
        >
           <Image
            fd={path}
            fileType='blob'
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      ))}
    </div>
  );

  return <div className='p-d-container' tabIndex={0}
              onWheel={handleWheel}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'ArrowLeft') {
                  setIndex(Math.max(0, index - 1));
                } else if (e.key === 'ArrowRight') {
                  setIndex(Math.min(paths.length - 1, index + 1));
                } else if (e.key === 'Escape') {
                  onCloseDetail();
                }
              }}>
    <div className='p-d-close'>
      <Stack direction="row" spacing={2} alignItems="center">
        <ToggleButtonGroup
          value={viewMode}
          onChange={(_, newValue) => newValue && setViewMode(newValue)}
        >
          <Button value="single" aria-label="单页"><ViewCarousel /></Button>
          <Button value="list" aria-label="列表"><ViewList /></Button>
        </ToggleButtonGroup>
        <Button onClick={() => onCloseDetail()}>关闭</Button>
      </Stack>
    </div>

    <div className='p-d-content'>
      <div className='p-d-main' onScroll={handleScroll}>
        {viewMode === 'single' ? (
          <Image
            className='p-d-mainimg'
            onClick={handleImageClick}
            fd={paths[index]}
            fileType='blob'
          />
        ) : (
          listView()
        )}
      </div>

      <div className='p-d-dir-container'>
        <Select
          value={dirShow}
          onChange={(_, n: string|null) => {
            if (!isDirShow(n)) return;
            setDirShow(n);
            onChangeDirShow(n);
            setTimeout(() => {
              document.getElementById(`detail-index-${index}`)?.scrollIntoView({ behavior: 'smooth' });
            }, 200);
          }}
          indicator={<ArrowDropDown />}
          sx={{ marginBottom: 1 }}
        >
          <Option value='id'>页码</Option>
          <Option value='pic'>缩略图</Option>
        </Select>
        <div className='p-d-dir'>
          {dirShow == 'id' ? (
            <Stack>
              {Array.from({ length: paths.length }, (_, i) => i)
                .map(i => (
                  <Button
                    variant={i === index ? 'solid' : 'plain'}
                    id={`detail-index-${i}`}
                    onClick={() => setIndex(i)}
                    key={i}
                  >
                    第 {i + 1} 页
                  </Button>
                ))}
            </Stack>
          ) : (
            <Stack spacing={1} direction='column' alignItems='center'>
              {metaSmallPicPaths(md).map((path: string | undefined, i: number) => (
                <Image
                  style={{
                    border: i === index ? '2px solid blue' : ''
                  }}
                  id={`detail-index-${i}`}
                  onClick={() => setIndex(i)}
                  width={i === index ? 112 : 92}
                  fd={path}
                  key={i}
                  fileType='dataUrl'
                />
              ))}
            </Stack>
          )}
        </div>
      </div>
    </div>
  </div>;
}
