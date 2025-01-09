import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect } from 'react';
import '@fontsource/inter';
import Fake from './fake/Fake';
import { DownLoader } from './pages/DownLoader';
import { Viewer } from './pages/view/Viewer';
import Import from './pages/Import';

export default function App() {

  useEffect(() => {
    window.electron.ipcRenderer.on('open_root_dir', (args: string[]) => {
      window.globalState['root_dir'] = args[0];
    });
    window.electron.ipcRenderer.on('path_sep', (args: string[]) => {
      window.globalState['path_sep'] = args[0];
    });
  }, []);


  return (
    <Router>
      <Routes>
        <Route path='/' element={<Fake />}/>
        <Route path='/fetch' element={<DownLoader />} />
        <Route path='/view' element={<Viewer />} />
        <Route path='/import' element={<Import />} />
      </Routes>
   </Router>
  );
}
