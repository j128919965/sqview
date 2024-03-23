import { useEffect, useState } from 'react';
import { getMetaPaths, readFileAsString, readFileBytes } from '../utils/fileUtils';
import './Viewer.css';
import Toast from '../components';
import { Card } from '@mui/joy';
import Image from '../components/Image';

const metaFirstPicPath = (meta: ProjectMeta) => {
  return `${window.globalState.root_dir}\\${meta.createdAt}\\${meta.indexToSmallFileName[0]}`;
};


const loadMetas = async (): Promise<ProjectMeta[]> => {
  const rootDir = window.globalState.root_dir;
  if (!rootDir) {
    throw new Error('root dir not choosed');
  }
  const metaPaths = await getMetaPaths(rootDir);

  const metas: ProjectMeta[] = [];
  for (let metaPath of metaPaths) {
    const str = await readFileAsString(metaPath, 'utf-8');
    if (!str) {
      continue;
    }
    const meta: ProjectMeta = JSON.parse(str);
    metas.push(meta);
  }

  return metas;
};

export const Viewer = () => {

  const [metas, setMetas] = useState<ProjectMeta[]>();

  const loadPreviewList = async () => {
    try {
      const metas = await loadMetas();
      console.log(metas);
      setMetas(metas);
      for (let meta of metas) {

      }

    } catch (e: any) {
      console.error(e);
      Toast.error('加载失败 , ' + e.message);
    }

  };

  useEffect(() => {
    loadPreviewList();
  }, []);

  return <div className='p-v-pic_list'>
    {
      !metas ? <h1>预览加载中</h1> : metas.map(meta => <Card  key={meta.createdAt}>
        <Image id={metaFirstPicPath(meta)} fileType='dataUrl' height={160} width={112} />
      </Card>)
    }

  </div>;
};
