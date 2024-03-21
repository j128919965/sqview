import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { List, ListItem, ListItemButton, ListItemContent, ListItemDecorator } from '@mui/joy';
import { Home, KeyboardArrowRight } from '@mui/icons-material';
import { getSubDirs } from './utils/fileUtils';
import '@fontsource/inter';
import Fake from './fake/Fake';

function Hello() {
  const [subDirs, setSubDirs] = useState<string[]>([]);

  useEffect(() => {


    window.electron.ipcRenderer.on('open_root_dir', (args: string[]) => {
      getSubDirs(args[0])
        .then((res: string[]) => setSubDirs(res))
        .catch((err: Error) => setSubDirs([err.message]));
    });

  }, []);

  return (
    <div>
      {
        subDirs.length === 0 ? <Fake /> : <List>
          {
            subDirs.map(subDir => <ListItem variant='soft' key={subDir}>
              <ListItemButton onClick={() => alert('click')}>
                <ListItemDecorator> <Home /> </ListItemDecorator>
                <ListItemContent>{subDir}</ListItemContent>
                <KeyboardArrowRight />
              </ListItemButton>
            </ListItem>)
          }
        </List>
      }


    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Hello />} />
      </Routes>
    </Router>
  );
}
