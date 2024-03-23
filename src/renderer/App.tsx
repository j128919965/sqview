import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { getSubDirs } from './utils/fileUtils';
import '@fontsource/inter';
import Fake from './fake/Fake';
import { DownLoader } from './pages/DownLoader';
import { Viewer } from './pages/Viewer';

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
        subDirs.length === 0 ? <Fake /> : <DownLoader />
      }
    </div>
  );
}


export default function App() {

  useEffect(() => {
    window.electron.ipcRenderer.on('open_root_dir', (args: string[]) => {
      window.globalState['root_dir'] = args[0];
    });
  }, []);
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Fake />} />
        <Route path='/fetch' element={<DownLoader />} />
        <Route path='/view' element={<Viewer />} />
      </Routes>
    </Router>
  );
}
