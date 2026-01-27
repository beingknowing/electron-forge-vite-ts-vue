import "reflect-metadata"

import { app, BrowserWindow, ipcMain, powerMonitor, shell } from 'electron';
import path from 'path';
import { startServer } from './server';

import dotenv from '@dotenvx/dotenvx';

// 加载加密的环境变量
const env = process.env.NODE_ENV || 'development';
const envFiles = ['.env', `.env.${env}`, '.env.local'];

// 使用 dotenvx 解密并加载配置（config 是同步函数，不需要 await）
dotenv.config({
  path: envFiles,
  override: true,
})

console.log(`Running in ${env} mode`, process.env.sn_host);

// 拦截所有链接，在系统默认浏览器中打开
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    // 阻止导航，改为在外部浏览器打开
    event.preventDefault();
    shell.openExternal(url);
  });

  contents.setWindowOpenHandler(({ url }) => {
    // 阻止新窗口，改为在外部浏览器打开
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  console.log('electron-squirrel-startup');
  app.quit();
}

const createWindow = () => {
  startServer()

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    opacity: 1,
    minWidth: 1024,
    minHeight: 900,
    // fullscreen: false,
    fullscreenable: true,

    center: true,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload', 'index.js'),
    },
    // have no visual flash (1)
    show: true,
    // backgroundColor: 'hsl(180, 80%, 58%)'
  });
  // mainWindow.webContents.openDevTools();
  // and load the index.html of the app.
  if (INDEX_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(INDEX_VITE_DEV_SERVER_URL);
  } else {

    mainWindow.loadFile(path.join(__dirname, `../renderer/${INDEX_VITE_NAME}.html`));


  }

  // have no visual flash (2)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  powerMonitor.on('resume', () => {
    console.log('powerMonitor resume');
  })

  powerMonitor.on('suspend', () => {
    console.log('powerMonitor suspend');
  })
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log(`app ready ${new Date().toLocaleString()} 44`);
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  console.log('app window-all-closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('app activate');
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============================ //
// study
app.on('before-quit', (_e) => {
  console.log('app before-quit');
});

app.on('browser-window-blur', () => {
  console.log('app browser-window-blur');
});

app.on('browser-window-focus', () => {
  console.log('app browser-window-focus');
});
import ticketController from "./ticketController";
app.whenReady().then(_v => {
  console.log("🚀 ~ app.whenReady() process.env.sn_host:", process.env.sn_host)

  ipcMain.handle('ticket', ticketController.onTicketSubmit)

  // 获取 Windows 域账号并通过 IPC 提供给 renderer
  ipcMain.handle('get-domain-user', ticketController.getDomainUser);

  // ipcMain.handle()
}) 
