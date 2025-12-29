import React, { useEffect, useState } from 'react';
import { dataUrlCache } from '../utils/cache/dataUrlCache';
import { Button } from '@mui/joy';
import { FileType } from '../data';

// 定义 Image 组件的 props 类型
interface ImageProps {
  fd?: string; // 文件描述符
  fileType: FileType; // 假设 fileType 是一个字符串
  // 其他可能的 props 类型...
  // ...restProps 可以是任何剩余的合法 React 属性类型
  [key: string]: any; // 这会允许任何额外的属性，但通常不推荐这样做，因为它失去了类型安全性
}

const Image: React.FC<ImageProps> = ({ fd, fileType, ...restProps }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (fd) {
      dataUrlCache.get(fd, fileType)
        .then(dataUrl => dataUrl && setImageUrl(dataUrl))
        .catch(err => console.error('Error fetching image URL:', err));
    }
  }, [fd]); // 当id改变时，重新获取图片URL

  return <>
    {
      imageUrl ?
        <img
          style={{ visibility: ready ? 'visible' : 'hidden' }}
          src={imageUrl}
          alt='' // 你可以设置一个默认的alt文本，或者让用户传递一个
          {...restProps} // 展开其他属性
          onError={err => {
            console.error(err);
          }}
          onLoad={() => setReady(true)}
        /> : <></>
    }
    <div style={{ display: ready ? 'none' : 'block' }}><Button loading variant='plain'>
      Plain
    </Button></div>
  </>;

};

export default Image;
