import { createRoot } from 'react-dom/client';
import App from './App';


window.globalState = { root_dir: undefined }

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
