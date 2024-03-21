import { BrowserWindow, dialog, Menu } from 'electron';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
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
    return [
      {
        label: '文件',
        submenu: [
          {
            label: '选择根目录',
            accelerator: 'Ctrl+O',
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
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
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
            }
          ]
      }
    ];
  }
}
