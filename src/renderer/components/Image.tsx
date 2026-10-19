import React, { useEffect, useState } from 'react';
import { Button, CircularProgress } from '@mui/joy';
import { dataUrlCache } from '../utils/cache/dataUrlCache';
import { FileType } from '../data';

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  fd?: string;
  fileType: FileType;
  retryable?: boolean;
}

const Image: React.FC<ImageProps> = ({ fd, fileType, onLoad, onError, style, alt = '', retryable = true, ...restProps }) => {
  const [request, setRequest] = useState<{ fd?: string; fileType: FileType; url?: string }>({ fileType });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setRequest({ fd, fileType });
    setReady(false);
    setFailed(false);
    if (fd) {
      dataUrlCache.get(fd, fileType).then(url => {
        if (active) {
          if (url) setRequest({ fd, fileType, url });
          else setFailed(true);
        }
        return undefined;
      }).catch(() => { if (active) setFailed(true); });
    }
    return () => { active = false; };
  }, [fd, fileType, retry]);

  const url = request.fd === fd && request.fileType === fileType ? request.url : undefined;
  let status: React.ReactNode = <CircularProgress size='sm' aria-label='图片加载中' />;
  if (!fd) status = '图片缺失';
  else if (failed) status = retryable ? <Button size='sm' variant='plain' onClick={event => {
    event.stopPropagation();
    dataUrlCache.delete(fd, fileType);
    setRetry(value => value + 1);
  }}>加载失败，重试</Button> : '加载失败';
  return <>
    {url && <img {...restProps} alt={alt} src={url} style={{ ...style, visibility: ready ? style?.visibility : 'hidden' }}
      onLoad={event => { setReady(true); onLoad?.(event); }}
      onError={event => { setFailed(true); onError?.(event); }} />}
    {(!url || !ready || failed) && <div role='status' className='p-image-status'>
      {status}
    </div>}
  </>;
};

export default Image;
