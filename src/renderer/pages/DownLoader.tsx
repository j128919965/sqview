import { Button, Divider, Input } from '@mui/joy';
import { useState } from 'react';
import { loadAndSaveGroup, sendPicRequest, SqPicUrlHelper } from '../utils/picDownloader';
import Toast from '../components';
import Logs from '../components/Logs';

export const DownLoader = () => {

  const [logs, setLogs] = useState<string[]>([]);
  const [lastUrl, setLastUrl] = useState<string>('');

  const startDownLoad = async () => {
    if (!lastUrl) {
      return;
    }
    if (!window.globalState.root_dir) {
      Toast.error('未选择根目录');
      return;
    }
    const wrapper: { logs: string[] } = { logs: [] };
    await loadAndSaveGroup(
      SqPicUrlHelper.urls(lastUrl),
      (log) => {
        wrapper.logs = [...wrapper.logs, log];
        setLogs(wrapper.logs);
      },
      sendPicRequest
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
      <div style={{height: '20px'}}/>
      <Button onClick={startDownLoad}>下载</Button>
    </div>
    <Logs logs={logs} maxHeight='calc(100vh - 100px)' />
  </>;
};
