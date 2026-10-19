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
import { loadAndSaveGroup } from '../utils/picDownloader';
import CustomProgressBar from '../components/CustomProgressBar';
import Logs from '../components/Logs';

export default () => {

  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(0);
  const [failure, setFailure] = useState(0);
  const [all, setAll] = useState(0)
  const [started, setStarted] = useState(false)

  const startImport = async (mode: 'dir' | 'zip') => {
    if (!window.globalState.root_dir) {
      Toast.error('未选择根目录');
      return;
    }

    let originPath;
    let groupName;
    let sep = window.globalState.path_sep


    if(mode === 'dir') {
      originPath = await chooseDirectory()

      if (!originPath) {
        Toast.error('已取消');
        return;
      }

      groupName = originPath.split(sep).pop() ?? undefined;
    } else {
      let openResult = await chooseZipAndReturnDirectory(window.globalState.root_dir)

      if (!openResult) {
        Toast.error('已取消');
        return;
      }

      originPath = openResult.tempPath;
      groupName = openResult.originZipFile.split(sep).pop()?.split('.')[0] ?? undefined;
    }

    console.log("groupName",groupName)

    const wrapper: { logs: string[] } = { logs: [] };


    const fileNames = await getSubFiles(originPath);
    fileNames.sort((a, b) => parseInt(a.split('.')[0], 10) - parseInt(b.split('.')[0], 10));


    const urls = fileNames.map(f => originPath + sep + f);

    setAll(urls.length)
    setStarted(true)
    setLogs(wrapper.logs)
    setSuccess(0)
    setFailure(0)

    await loadAndSaveGroup(urls,
      readFileBytes,
      {
        parallel: true,
        onlyAddFailureLogs: true,
        addLog: (log) => {
          wrapper.logs = [...wrapper.logs, log];
          setLogs(wrapper.logs);
        },
        setProcess: (all, success, failure) => {
          setSuccess(success);
          setFailure(failure);
        },
        groupName
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
    {
      started ? <CustomProgressBar success={success} failure={failure} all={all} /> : <></>
    }
    <Logs logs={logs} maxHeight='calc(100vh - 100px)' />
  </div>;
}
