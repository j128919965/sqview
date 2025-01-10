import { App, BrowserWindow, dialog, Menu } from 'electron';
import test from './vedio';
const process = require('node:process')

const isMac = process.platform === 'darwin'

export default class MenuBuilder {
  mainWindow: BrowserWindow;
  app: App;

  constructor(mainWindow: BrowserWindow, app: App) {
    this.mainWindow = mainWindow;
    this.app = app;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template = this.buildDefaultTemplate(this.mainWindow);

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          }
        }
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDefaultTemplate(mainWindow: BrowserWindow) {
    const forMac = isMac ? [{
      label: 'SqView',
      submenu: [
        { label: '关于' }
      ]
    }] : []
    return [
      ...forMac,
      {
        label: '文件',
        submenu: [
          {
            label: '选择根目录',
            accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
            click() {
              dialog.showOpenDialog({
                properties: ['openDirectory']
              }).then(result => {
                if (!result.canceled) {
                  mainWindow.webContents.send('open_root_dir', result.filePaths);
                }
                return result;
              }).catch(console.error);
            }
          },
          {
            label: '关闭窗口',
            accelerator: isMac ? 'Cmd+W' : 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            }
          },
          {
            label: '退出应用',
            accelerator: isMac ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.app.quit()
            }
          }
        ]
      },
      {
        label: '视图',
        submenu:
          [
            {
              label: '重启',
              accelerator: 'Ctrl+R',
              click: () => {
                this.mainWindow.webContents.reload();
              }
            },
            {
              label: '重置',
              accelerator: 'Ctrl+B',
              click: () => {
                mainWindow.webContents.send('back_to_root');
              }
            },
            {
              label: '全屏',
              accelerator: 'F11',
              click: () => {
                this.mainWindow.setFullScreen(
                  !this.mainWindow.isFullScreen()
                );
              }
            },
            {
              label: '打开控制台',
              accelerator: 'Alt+Ctrl+I',
              click: () => {
                this.mainWindow.webContents.toggleDevTools();
              }
            },
            {
              label: '测试文件分片',
              click() {
                test()
              }
            }
          ]
      }
    ];
  }
}
