import Image from '../../components/Image';
import React, { useEffect, useState } from 'react';
import { Button, Option, Select, Stack } from '@mui/joy';
import { ArrowDropDown } from '@mui/icons-material';
import { DirShow, isDirShow, ProjectMeta } from '../../data';
import { isValidString } from '../../utils/stringUtils';

const idToPath = (meta: ProjectMeta,id: string|undefined) => {
  if (isValidString(id)) {
    return `${window.globalState.root_dir}\\${meta.createdAt}\\${id}`;
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

  const [prevTitle] = useState<string>(document.title);

  const setIndex = (idx: number) => {
    setIndexOrigin(idx);
    document.getElementById(`detail-index-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
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
        .map(i => <Button variant={i == index ? 'solid' : 'plain'}
                          id={`detail-index-${i}`}
                          onClick={() => setIndex(i)}
                          key={i}>第 {i + 1} 页</Button>)
    }
    </Stack>;
  };

  return <div className='p-d-container' tabIndex={0} onKeyDown={(e: React.KeyboardEvent) => {
    console.log(e.key);
    if (e.key == 'ArrowLeft') {
      setIndex(Math.max(0, index - 1)); // 向前一页
    } else if (e.key === 'ArrowRight') {
      setIndex(Math.min(paths.length - 1, index + 1)); // 向后一页
    } else if (e.key === 'Escape') {
      onCloseDetail()
    }
  }}>
    <div className='p-d-close '><Button onClick={() => onCloseDetail()}>关闭</Button></div>
    <div className='p-d-dir-container'>
      <Select defaultValue={dirShow}
              onChange={(_, n: string|null) => {
                if (!isDirShow(n)) {
                  return
                }
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
        {
          dirShow == 'id' ? idDir()
            : <Stack spacing={1} direction='column' alignItems='center'>{metaSmallPicPaths(md)
              .map((path: string | undefined, i: number) => <Image
                style={{
                  border: i == index ? '2px solid blue' : ''
                }}
                id={`detail-index-${i}`}
                onClick={() => setIndex(i)}
                width={i == index ? 112 : 92} fd={path}
                key={i} fileType='dataUrl' />)}</Stack>
        }
      </div>

    </div>

    <Image className='p-d-mainimg' onClick={handleImageClick} fd={paths[index]} fileType='blob' />
  </div>;
}
