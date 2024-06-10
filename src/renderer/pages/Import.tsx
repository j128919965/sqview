import {
  chooseDirectory,
  chooseZipAndReturnDirectory,
  deleteDir,
  getSubFiles,
  readFileBytes
} from '../utils/fileUtils';
import { Button } from '@mui/joy';
import { useState } from 'react';
import Toast from '../components';
import Logs from '../components/Logs';
import { loadAndSaveGroup } from '../utils/picDownloader';

export default () => {

  const [logs, setLogs] = useState<string[]>([]);
  const startImport = async (mode: 'dir' | 'zip') => {
    if (!window.globalState.root_dir) {
      Toast.error('未选择根目录');
      return;
    }

    let originPath = mode == 'dir' ? await chooseDirectory() :
      await chooseZipAndReturnDirectory(window.globalState.root_dir);
    if (!originPath) {
      Toast.error('已取消');
      return;
    }


    const wrapper: { logs: string[] } = { logs: [] };


    const fileNames = await getSubFiles(originPath);
    fileNames.sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0]));
    const urls = fileNames.map(f => `${originPath}\\${f}`);

    await loadAndSaveGroup(urls,
      (log) => {
        wrapper.logs = [...wrapper.logs, log];
        setLogs(wrapper.logs);
      },
      readFileBytes,
      {
        parallel: true
      }
    );


    await deleteDir(originPath);
  };

  return <div>
    <div style={{
      display: 'flex',
      padding: '30px 100px',
      flexDirection: 'column',
      justifyContent: 'space-around'
    }}>
      <Button onClick={() => (startImport('dir'))}>选择文件夹导入（完成后删除源文件夹）</Button>
    </div>
    <div style={{
      padding: '0 100px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around'
    }}>
      <Button onClick={() => startImport('zip')}>选择Zip压缩文件导入（完成后删除源文件）</Button>
    </div>
    <Logs logs={logs} maxHeight='calc(100vh - 100px)' />
  </div>;
}
