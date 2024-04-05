import { getSubFiles, mkdirs, readFileBytes, writeFileBytes } from '../utils/fileUtils';
import { compress, randomUUID } from '../utils/zstdUtils';
import { compressImage } from '../utils/imgUtils';
import { Button, Input, List, ListItem, ListItemContent, ListItemDecorator } from '@mui/joy';
import { useState } from 'react';
import Toast from '../components';
import { Home } from '@mui/icons-material';
import { ProjectMeta } from '../data';

const importGourp = async (originPath: string, addLog: (log: string) => void) => {
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
        await writeFileBytes(path, compressed);

        const smallUUID = randomUUID();
        const compressedImage = await compressImage(buf);

        const smallImg = await compress(compressedImage!!);
        const smallPath = `${dirPath}\\${smallUUID}`;
        await writeFileBytes(smallPath, smallImg);
        indexToSmallFileName[i] = smallUUID;
        indexToFileName[i] = uuid;
        addLog(`导入第 ${i} 个文件成功`)
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

  await writeFileBytes(path, JSON.stringify(meta));
  addLog(`全部文件导入成功`)
  Toast.success('导入成功')
};


export default ()=>{
  const [originPath, setOriginPath] = useState<string>('');

  const [logs, setLogs] = useState<string[]>([]);
  const startImport = async () => {
    if (!window.globalState.root_dir) {
      Toast.error('未选择根目录')
      return
    }
    const wrapper: { logs: string[] } = { logs: [] };
    await importGourp(originPath,
      (log) => {
        wrapper.logs = [...wrapper.logs, log];
        setLogs(wrapper.logs);
      });
  };

  return <div>
    <div style={{height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-around'}}>
      <Input value={originPath} onChange={(e) => {
        setOriginPath(e.target.value);
      }} />
      <Button onClick={()=>(startImport())}>导入</Button>
    </div>
    {
      <List sx={{overflowY: 'auto', overFlowX:'hidden', maxHeight:'calc(100vh - 100px)'}}>
        {
          logs.map((log: string, index) => <ListItem variant='soft' key={index}>
              <ListItemDecorator> <Home /> </ListItemDecorator>
              <ListItemContent>{log}</ListItemContent>
            </ListItem>
          )
        }
      </List>
    }
  </div>
}
