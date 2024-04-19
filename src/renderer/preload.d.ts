import { ElectronHandler } from '../main/preload';
import { GlobalState } from './data';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    globalState: Record<GlobalState, any>
  }
}

export { };
