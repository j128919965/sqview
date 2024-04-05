import Image from '../../components/Image';
import React, { useEffect, useState } from 'react';
import { Button, Option, Select, Stack } from '@mui/joy';
import { ArrowDropDown } from '@mui/icons-material';
import { ProjectMeta } from '../../data';

const metaPicPaths = (meta: ProjectMeta) => {
  return meta.indexToFileName.map(id => `${window.globalState.root_dir}\\${meta.createdAt}\\${id}`);
};

const metaSmallPicPaths = (meta: ProjectMeta) => {
  return meta.indexToSmallFileName.map(id => `${window.globalState.root_dir}\\${meta.createdAt}\\${id}`);
};

export default (props: { md: ProjectMeta, onCloseDetail: () => void }) => {
  const { md, onCloseDetail } = props;
  const paths = metaPicPaths(md);
  const [index, setIndexOrigin] = useState(0);
  const [dirShow, setDirShow] = useState<'id' | 'pic'>('pic');

  const [prevTitle] = useState<string>(document.title);

  const setIndex = (idx: number) => {
    setIndexOrigin(idx);
    document.title = `第 ${idx + 1} / ${paths.length} 页`;
  };

  useEffect(() => {
    setIndex(0);
    return () => {
      document.title = prevTitle;
    };
  }, []);

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


  const idDir = () => {
    return <Stack>{
      Array.from({ length: paths.length }, (_, i) => i)
        .map(i => <Button variant='plain' onClick={() => setIndex(i)} key={i}>第 {i + 1} 页</Button>)
    }
    </Stack>;
  };

  return <div className='p-d-container' tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => {
    console.log(e.key);
    if (e.key == 'ArrowLeft') {
      setIndex(Math.max(0, index - 1)); // 向前一页
    } else if (e.key === 'ArrowRight') {
      setIndex(Math.min(paths.length - 1, index + 1)); // 向后一页
    }
  }}>
    <div className='p-d-close '><Button onClick={() => onCloseDetail()}>关闭</Button></div>
    <div className='p-d-dir'>
      <Select defaultValue='pic'
              onChange={(e, n) => {
                // @ts-ignore
                setDirShow(n);
              }}
              indicator={<ArrowDropDown />}
              sx={{ marginBottom: 1 }}
      >
        <Option value='id'>页码</Option>
        <Option value='pic'>缩略图</Option>
      </Select>
      {
        dirShow == 'id' ? idDir()
          : <Stack spacing={1} direction='column'>{metaSmallPicPaths(md)
            .map((path: string, i: number) => <Image
              onClick={() => setIndex(i)}
              width={112} id={path}
              key={path} fileType='dataUrl' />)}</Stack>
      }
    </div>

    <Image className='p-d-mainimg' onClick={handleImageClick} id={paths[index]} fileType='blob' />
  </div>;
}
