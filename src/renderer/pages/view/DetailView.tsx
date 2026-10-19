import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Option, Select, ToggleButtonGroup } from '@mui/joy';
import { ViewCarousel, ViewList } from '@mui/icons-material';
import Image from '../../components/Image';
import { DirShow, isDirShow, ProjectMeta } from '../../data';
import { isValidString } from '../../utils/stringUtils';
import ScrollPage from './ScrollPage';
import { imageSize, turnPageForWheel, WheelGesture } from './readerUtils';

type ViewMode = 'single' | 'list';
type Dimensions = { width: number; height: number };

export default function DetailView(props: {
  md: ProjectMeta;
  defaultDirShow: DirShow;
  onCloseDetail: () => void;
  onChangeDirShow: (dirShow: DirShow) => void;
  onNextAlbum?: () => void;
  nextAlbumName?: string;
}) {
  const { md, defaultDirShow, onCloseDetail, onChangeDirShow, onNextAlbum, nextAlbumName } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const directoryRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pendingPage = useRef<number | null>(null);
  const animationFrame = useRef<number>();
  const wheelGesture = useRef<WheelGesture>({ lastTime: 0, delta: 0, turned: false, scrolled: false });
  const [index, setIndex] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [dirShow, setDirShow] = useState(defaultDirShow);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [fitMode, setFitMode] = useState<'page' | 'width'>('page');
  const [zoom, setZoom] = useState(1);
  const [viewport, setViewport] = useState<Dimensions>({ width: 800, height: 600 });
  const [dimensions, setDimensions] = useState<Record<string, Dimensions>>({});
  const [navigation, setNavigation] = useState(0);
  const pageCount = md.indexToFileName.length;
  const currentIndex = Math.min(index, Math.max(0, pageCount - 1));

  const rootDir = window.globalState.root_dir;
  const pathSep = window.globalState.path_sep;
  const toPath = useCallback((id?: string) => isValidString(id)
    ? `${rootDir}${pathSep}${md.createdAt}${pathSep}${id}`
    : undefined, [rootDir, pathSep, md.createdAt]);
  const paths = useMemo(() => md.indexToFileName.map(toPath), [md.indexToFileName, toPath]);
  const currentPath = paths[currentIndex];
  const available = { width: Math.max(1, viewport.width - 32), height: Math.max(1, viewport.height - 32) };
  const sizeFor = (path?: string) => imageSize(path ? dimensions[path] : undefined, available, fitMode, zoom);

  const goToPage = useCallback((page: number) => {
    if (!pageCount) return;
    const target = Math.max(0, Math.min(pageCount - 1, page));
    pendingPage.current = target;
    setIndex(target);
    setPageInput(String(target + 1));
    setNavigation(value => value + 1);
  }, [pageCount]);

  const recordDimensions = useCallback((path: string | undefined, image: HTMLImageElement) => {
    if (!path || !image.naturalWidth || !image.naturalHeight) return;
    const { naturalWidth: width, naturalHeight: height } = image;
    setDimensions(previous => previous[path]?.width === width && previous[path]?.height === height
      ? previous : { ...previous, [path]: { width, height } });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    containerRef.current?.focus({ preventScroll: true });
    return () => {
      document.title = previousTitle;
      if (animationFrame.current !== undefined) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  useEffect(() => {
    document.title = `${md.name} · 第 ${pageCount ? currentIndex + 1 : 0} / ${pageCount} 页`;
    setPageInput(String(pageCount ? currentIndex + 1 : 0));
  }, [currentIndex, pageCount, md.name]);

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;
    const measure = () => setViewport({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    setIndex(0);
    setPageInput('1');
    pendingPage.current = 0;
    setNavigation(value => value + 1);
    wheelGesture.current = { lastTime: 0, delta: 0, turned: false, scrolled: false };
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
  }, [md.createdAt]);

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    if (viewMode === 'single') {
      element.scrollTop = 0;
      element.scrollLeft = 0;
      pendingPage.current = null;
      return;
    }
    const target = pendingPage.current;
    if (target === null) return;
    const page = pageRefs.current[target];
    if (!page) return;
    element.scrollTop += page.getBoundingClientRect().top - element.getBoundingClientRect().top - 16;
    const targetPath = paths[target];
    // Keep the target anchored until its true image dimensions are known.
    if (!targetPath || dimensions[targetPath]) pendingPage.current = null;
  }, [navigation, viewMode, dimensions, viewport, zoom, fitMode, currentIndex, paths]);

  useLayoutEffect(() => {
    const directory = directoryRef.current;
    const button = directory?.querySelector<HTMLElement>(`[data-page="${currentIndex}"]`);
    if (!directory || !button) return;
    const bounds = directory.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    if (item.top < bounds.top) directory.scrollTop += item.top - bounds.top;
    else if (item.bottom > bounds.bottom) directory.scrollTop += item.bottom - bounds.bottom;
  }, [currentIndex, dirShow]);

  const changeZoom = useCallback((value: number) => {
    pendingPage.current = currentIndex;
    setZoom(Math.max(0.25, Math.min(3, value)));
  }, [currentIndex]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        changeZoom(zoom * Math.exp(-event.deltaY * 0.002));
        return;
      }
      if (viewMode === 'list') {
        pendingPage.current = null;
        return;
      }
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0) return;
      const canScroll = event.deltaY > 0
        ? element.scrollTop + element.clientHeight < element.scrollHeight - 2
        : element.scrollTop > 2;
      const turn = turnPageForWheel(wheelGesture.current, event, canScroll, element.clientHeight);
      if (!canScroll || wheelGesture.current.turned) event.preventDefault();
      if (turn) goToPage(currentIndex + turn);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [currentIndex, viewMode, zoom, changeZoom, goToPage]);

  const handleScroll = () => {
    if (viewMode !== 'list' || pendingPage.current !== null || animationFrame.current !== undefined) return;
    animationFrame.current = requestAnimationFrame(() => {
      animationFrame.current = undefined;
      const element = viewportRef.current;
      if (!element || !pageCount) return;
      const line = element.getBoundingClientRect().top + Math.min(160, element.clientHeight / 3);
      let low = 0;
      let high = pageCount - 1;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if ((pageRefs.current[middle]?.getBoundingClientRect().bottom ?? Infinity) <= line) low = middle + 1;
        else high = middle;
      }
      setIndex(low);
    });
  };

  const setFit = (mode: 'page' | 'width') => {
    pendingPage.current = currentIndex;
    setFitMode(mode);
    setZoom(1);
    setNavigation(value => value + 1);
  };

  const currentSize = sizeFor(currentPath);

  return <div className='p-d-container' ref={containerRef} role='dialog' aria-label='图集阅读器' tabIndex={-1} onKeyDown={event => {
    if (event.defaultPrevented || (event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"], [role="combobox"]')) return;
    if (event.key === 'Escape') onCloseDetail();
    else if (event.key === 'ArrowLeft' || (viewMode === 'single' && event.key === 'PageUp')) goToPage(currentIndex - 1);
    else if (event.key === 'ArrowRight' || (viewMode === 'single' && event.key === 'PageDown')) goToPage(currentIndex + 1);
    else if (event.key === 'Home') goToPage(0);
    else if (event.key === 'End') goToPage(pageCount - 1);
    else if (event.key === '+' || event.key === '=') changeZoom(zoom + 0.1);
    else if (event.key === '-') changeZoom(zoom - 0.1);
    else {
      pendingPage.current = null;
      return;
    }
    event.preventDefault();
  }}>
    <div className='p-d-toolbar'>
      <div className='p-d-tools'>
        <ToggleButtonGroup size='sm' value={viewMode} aria-label='阅读模式' onChange={(_, value: ViewMode | null) => {
          if (!value) return;
          pendingPage.current = currentIndex;
          setViewMode(value);
          setNavigation(previous => previous + 1);
        }}>
          <Button value='single'><ViewCarousel fontSize='small' />翻页</Button>
          <Button value='list'><ViewList fontSize='small' />滚动</Button>
        </ToggleButtonGroup>
        <Button size='sm' variant={fitMode === 'page' ? 'soft' : 'plain'} onClick={() => setFit('page')}>适应窗口</Button>
        <Button size='sm' variant={fitMode === 'width' ? 'soft' : 'plain'} onClick={() => setFit('width')}>适应宽度</Button>
        <div className='p-d-zoom'>
          <Button size='sm' variant='plain' aria-label='缩小' disabled={zoom <= 0.25} onClick={() => changeZoom(zoom - 0.1)}>−</Button>
          <span title='相对于当前适应方式的缩放比例' aria-label='缩放比例'>{Math.round(zoom * 100)}%</span>
          <Button size='sm' variant='plain' aria-label='放大' disabled={zoom >= 3} onClick={() => changeZoom(zoom + 0.1)}>+</Button>
        </div>
      </div>
      <div className='p-d-tools'>
        <form className='p-d-page-form' onSubmit={event => {
          event.preventDefault();
          const page = Number(pageInput);
          if (Number.isInteger(page) && page >= 1 && page <= pageCount) goToPage(page - 1);
        }}>
          <Button size='sm' variant='plain' aria-label='上一页' disabled={currentIndex === 0 || !pageCount} onClick={() => goToPage(currentIndex - 1)}>上一页</Button>
          <Input size='sm' type='number' value={pageInput} onChange={event => setPageInput(event.target.value)}
            slotProps={{ input: { 'aria-label': '页码', min: 1, max: pageCount, step: 1, required: true } }} />
          <span>/ {pageCount}</span>
          <Button size='sm' type='submit' variant='soft' disabled={!pageCount}>跳转</Button>
          <Button size='sm' variant='plain' aria-label='下一页' disabled={currentIndex >= pageCount - 1} onClick={() => goToPage(currentIndex + 1)}>下一页</Button>
        </form>
        <Button size='sm' variant='soft' disabled={!onNextAlbum} title={nextAlbumName ?? '已是最后一个图集'} onClick={onNextAlbum}>下一图集</Button>
        <Button size='sm' variant='plain' onClick={onCloseDetail}>关闭</Button>
      </div>
    </div>
    <div className='p-d-content'>
      <div className='p-d-main' ref={viewportRef} onScroll={handleScroll} onPointerDown={() => {
        pendingPage.current = null;
        containerRef.current?.focus({ preventScroll: true });
      }} onTouchStart={() => { pendingPage.current = null; }} aria-label='阅读区域'>
        {!pageCount ? <div className='p-d-empty'>这个图集没有图片</div> : viewMode === 'single' ? (
          <div className='p-d-single' style={{ width: Math.max(viewport.width, currentSize.width + 32), minHeight: Math.max(viewport.height, currentSize.height + 32) }}>
            <Image key={currentPath ?? currentIndex} fd={currentPath} fileType='blob' className='p-d-mainimg'
              style={currentSize} alt={`第 ${currentIndex + 1} 页`} draggable={false}
              onLoad={event => recordDimensions(currentPath, event.currentTarget)} onClick={event => {
                if (zoom > 1 || currentSize.height > available.height + 1 || currentSize.width > available.width + 1) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                goToPage(currentIndex + (event.clientX - bounds.left < bounds.width / 2 ? -1 : 1));
              }} />
          </div>
        ) : (
          <div className='p-d-list-container' style={{ paddingBottom: Math.max(16, viewport.height - sizeFor(paths[pageCount - 1]).height - 16) }}>
            {paths.map((path, page) => <ScrollPage key={`${md.createdAt}-${page}`} path={path} page={page}
              active={page === currentIndex} size={sizeFor(path)} viewportRef={viewportRef}
              pageRef={element => { pageRefs.current[page] = element; }}
              onLoad={event => recordDimensions(path, event.currentTarget)} />)}
          </div>
        )}
      </div>
      <aside className='p-d-dir-container' aria-label='页面目录'>
        <Select size='sm' value={dirShow} aria-label='目录显示方式' onChange={(_, value) => {
          if (!isDirShow(value)) return;
          setDirShow(value);
          onChangeDirShow(value);
        }}>
          <Option value='id'>页码</Option>
          <Option value='pic'>缩略图</Option>
        </Select>
        <div className='p-d-dir' ref={directoryRef}>
          {paths.map((_, page) => <button type='button' key={page} data-page={page}
            className={`p-d-page-button${page === currentIndex ? ' is-active' : ''}`}
            aria-label={`跳到第 ${page + 1} 页`} aria-current={page === currentIndex ? 'page' : undefined}
            onClick={() => goToPage(page)}>
            {dirShow === 'pic' && <Image fd={toPath(md.indexToSmallFileName[page])} fileType='dataUrl' width={96} retryable={false} alt='' draggable={false} />}
            <span>第 {page + 1} 页</span>
          </button>)}
        </div>
      </aside>
    </div>
  </div>;
}
