import { Home } from '@mui/icons-material';
import { Button, Input, List, ListItem, ListItemContent, ListItemDecorator } from '@mui/joy';
import { useState } from 'react';
import { downLoadGroup } from '../utils/picDownloader';
import Toast from '../components';

export const DownLoader = () => {

  const [logs, setLogs] = useState<string[]>([]);
  const [lastUrl, setLastUrl] = useState<string>('');

  const startDownLoad = async () => {
    if (!lastUrl) {
      return;
    }
    if (!window.globalState.root_dir) {
      Toast.error('未选择根目录')
      return
    }
    const wrapper: { logs: string[] } = { logs: [] };
    await downLoadGroup(lastUrl,
      window.globalState['root_dir'],
      (log) => {
        wrapper.logs = [...wrapper.logs, log];
        setLogs(wrapper.logs);
      });
  };


  return <>
    <div style={{height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-around'}}>
      <Input value={lastUrl} onChange={(e) => {
        setLastUrl(e.target.value);
      }} />
      <Button onClick={startDownLoad}>下载</Button>
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
  </>;
};
