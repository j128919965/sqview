import { Home } from '@mui/icons-material';
import { Button, Input, List, ListItem, ListItemContent, ListItemDecorator } from '@mui/joy';
import { useState } from 'react';
import { downLoadGroup } from '../utils/picDownloader';

export const DownLoader = () => {

  const [logs, setLogs] = useState<string[]>([]);


  const [lastUrl, setLastUrl] = useState<string>();

  const [loading, setLoading] = useState(false);

  const startDownLoad = async () => {
    if (!lastUrl) {
      return;
    }
    setLoading(true);
    const wrapper: { logs: string[] } = { logs: [] };
    await downLoadGroup(lastUrl,
      window.globalState['root_dir'],
      (log) => {
        wrapper.logs = [...wrapper.logs, log];
        setLogs(wrapper.logs);
      });
  };


  return <>
    <Input value={lastUrl} onChange={(e) => {
      setLastUrl(e.target.value);
    }} />
    <Button onClick={startDownLoad}>下载</Button>
    {
      <List>
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
