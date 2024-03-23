import { useEffect, useState } from 'react';
import { getMetaPaths, readFileAsString, writeFileBytesRenderer } from '../utils/fileUtils';
import './Viewer.css';
import Toast from '../components';
import { Card, Input, Stack, Typography } from '@mui/joy';
import Image from '../components/Image';
import { Done } from '@mui/icons-material';
import DetailView from './DetailView';
import { randomUUID } from 'node:crypto';

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

  metas.sort((a: ProjectMeta, b: ProjectMeta) => b.lastOpen - a.lastOpen);

  return metas;
};


export const Viewer = () => {

  const [metas, setMetas] = useState<ProjectMeta[]>([]);
  const [selectedMd, setSelectedMd] = useState<ProjectMeta>();

  const loadPreviewList = async () => {
    try {
      const metas = await loadMetas();
      console.log(metas)
      setMetas(metas);
    } catch (e: any) {
      console.error(e);
      Toast.error('加载失败 , ' + e.message);
    }
  };

  const updateMeta = async (md: ProjectMeta) => {
    const path = `${window.globalState.root_dir}\\${md.createdAt}\\meta.json`;
    await writeFileBytesRenderer(path, JSON.stringify(md));
    metas.sort((a: ProjectMeta, b: ProjectMeta) => b.lastOpen - a.lastOpen);
    setMetas([...metas]);
  };


  const MenuCard = (props: any) => {

    const md: ProjectMeta = props.md;
    const [focus, setFocus] = useState(false);
    const [temp, setTemp] = useState(md.name);

    const updateName = async () => {
      md.name = temp;
      await updateMeta(md);
    };

    return <Card sx={{ width: 160 }} key={`${md.createdAt}|${md.name}`}>
      <div>
        <Input variant='plain' value={temp}
               onChange={(e) => {
                 setTemp(e.target.value);
                 setFocus(true);
               }}
               onBlur={() => {
                 setTimeout(() => {
                   setFocus(false);
                   setTemp(md.name);
                 }, 300);
               }}
               endDecorator={focus ? <Done className='p-v-showbtn' onClick={updateName} /> : <></>} />
        <Typography level='body-sm'>{new Date(md.createdAt).toLocaleString()}</Typography>
      </div>
      <div style={{ width: 160, display: 'flex', justifyContent: 'center' }}
           className='p-v-showbtn'
           onClick={async () => {
             setSelectedMd(md);
             md.lastOpen = Date.now();
             await updateMeta(md);
           }}
      >
        <Image id={metaFirstPicPath(md)} fileType='dataUrl' height={228} width={160} />
      </div>
    </Card>;
  };

  useEffect(() => {
    loadPreviewList();
  }, []);

  return <> {
    selectedMd ? <DetailView onCloseDetail={() => setSelectedMd(undefined)} md={selectedMd} /> :
      <Stack spacing={2} direction='row' justifyContent="center" flexWrap='wrap' sx={{overflowY: 'auto',maxHeight:'100vh'}} useFlexGap>
        {
          !metas ? <h1>预览加载中</h1> : metas.map(md => <MenuCard md={md} />)
        }
      </Stack>
  }
  </>;
};
