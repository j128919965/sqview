import { Button, Input } from '@mui/joy';
import { useState } from 'react';
import { loadAndSaveGroup, sendPicRequest, SqPicUrlHelper } from '../utils/picDownloader';
import Toast from '../components';
import Logs from '../components/Logs';
import CustomProgressBar from '../components/CustomProgressBar';
import { retryAble } from '../utils/timeout';

export const DownLoader = () => {

  const [logs, setLogs] = useState<string[]>([]);
  const [lastUrl, setLastUrl] = useState<string>('');
  const [success, setSuccess] = useState(0);
  const [failure, setFailure] = useState(0);
  const [all, setAll] = useState(0);
  const [started, setStarted] = useState(false);

  const startDownLoad = async () => {
    if (!lastUrl) {
      return;
    }
    if (!window.globalState.root_dir) {
      Toast.error('未选择根目录');
      return;
    }
    const wrapper: { logs: string[] } = { logs: [] };
    const urls = SqPicUrlHelper.urls(lastUrl);

    setAll(urls.length);
    setStarted(true);
    setLogs(wrapper.logs)
    setSuccess(0)
    setFailure(0)

    await loadAndSaveGroup(
      urls,
      (url) => retryAble(3, () => sendPicRequest(url)),
      {
        parallel: true,
        onlyAddFailureLogs: true,
        parallelLimit: 3,
        addLog: (log) => {
          wrapper.logs = [...wrapper.logs, log];
          setLogs(wrapper.logs);
        },
        setProcess: (all, success, failure) => {
          setSuccess(success);
          setFailure(failure);
        }
      }
    );
  };


  return <>
    <div style={{
      display: 'flex',
      padding: '30px 100px',
      flexDirection: 'column',
      justifyContent: 'space-around'
    }}>
      <Input placeholder='请输入最后一页的url' value={lastUrl} onChange={(e) => {
        setLastUrl(e.target.value);
      }} />
      <div style={{ height: '20px' }} />
      <Button onClick={startDownLoad}>下载</Button>
    </div>
    {
      started ? <CustomProgressBar success={success} failure={failure} all={all} /> : <></>
    }
    <Logs logs={logs} maxHeight='calc(100vh - 100px)' />
  </>;
};
