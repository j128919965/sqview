import { getSubFiles, mkdirs, readFileBytes, writeFileBytesRenderer } from '../utils/fileUtils';
import { compress, randomUUID } from '../utils/zstdUtils';
import { compressImage } from '../utils/imgUtils';
import { Button, Input } from '@mui/joy';
import { useState } from 'react';
import Toast from '../components';

const downLoadGroup = async (originPath: string) => {
  const taskId: number = Date.now();
  const indexToFileName = [];
  const indexToSmallFileName = [];
  const dirPath = `${window.globalState.root_dir}\\${taskId}`;
  await mkdirs(dirPath);

  const fileNames = await getSubFiles(originPath)
  fileNames.sort((a,b)=>parseInt(a.split('.')[0]) - parseInt(b.split('.')[0]))
  const urls = fileNames.map(f => `${originPath}\\${f}`)


  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const buf: Uint8Array | undefined = await readFileBytes(url);
    if (buf) {
      try {
        const compressed = await compress(buf);
        const uuid = randomUUID();

        const path = `${dirPath}\\${uuid}`;
        await writeFileBytesRenderer(path, compressed);

        const smallUUID = randomUUID();
        const compressedImage = await compressImage(buf);

        const smallImg = await compress(compressedImage!!);
        const smallPath = `${dirPath}\\${smallUUID}`;
        await writeFileBytesRenderer(smallPath, smallImg);
        indexToSmallFileName[i] = smallUUID;
        indexToFileName[i] = uuid;
      } catch (err) {
        console.error(err);
      }
    }
  }

  const path = `${dirPath}\\meta.json`;

  const meta: ProjectMeta = {
    indexToFileName,
    indexToSmallFileName,
    createdAt: taskId,
    name: taskId.toString(),
    lastOpen: taskId
  };

  await writeFileBytesRenderer(path, JSON.stringify(meta));
  Toast.success('导入成功')
};


export default ()=>{
  const [originPath, setOriginPath] = useState<string>('');

  return <div>
    <div style={{height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-around'}}>
      <Input value={originPath} onChange={(e) => {
        setOriginPath(e.target.value);
      }} />
      <Button onClick={()=>downLoadGroup(originPath)}>下载</Button>
    </div>
  </div>
}
