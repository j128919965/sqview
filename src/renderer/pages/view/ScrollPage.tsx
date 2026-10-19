import React, { useEffect, useRef, useState } from 'react';
import Image from '../../components/Image';

export default function ScrollPage(props: {
  path?: string;
  page: number;
  active: boolean;
  size: { width: number; height: number };
  viewportRef: React.RefObject<HTMLDivElement>;
  pageRef: (element: HTMLDivElement | null) => void;
  onLoad: React.ReactEventHandler<HTMLImageElement>;
}) {
  const { path, page, active, size, viewportRef, pageRef, onLoad } = props;
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !viewportRef.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      root: viewportRef.current,
      rootMargin: '100% 0px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [viewportRef]);

  return <div ref={element => { elementRef.current = element; pageRef(element); }}
    className='p-d-list-item' data-reader-page={page} style={{ width: size.width, height: size.height }}>
    {(visible || active) && <Image fd={path} fileType='blob' style={size}
      alt={`第 ${page + 1} 页`} draggable={false} onLoad={onLoad} />}
  </div>;
}
