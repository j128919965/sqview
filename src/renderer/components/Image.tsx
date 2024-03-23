import React, { useEffect, useState } from 'react';
import { dataUrlCache } from '../utils/cache/dataUrlCache';

// @ts-ignore
const Image = ({ id, fileType, ...restProps }) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const dataUrl = await dataUrlCache.get(id, fileType);
        if (dataUrl) {
          setImageUrl(dataUrl);
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
      }
    };

    fetchImageUrl();
  }, [id]); // 当id改变时，重新获取图片URL

  return <>{
    imageUrl ? <img
      src={imageUrl}
      alt='' // 你可以设置一个默认的alt文本，或者让用户传递一个
      {...restProps} // 展开其他属性
      onError={err => {
        console.error(err);
      }}
    /> : 'loading'
  }</>;

};

export default Image;
