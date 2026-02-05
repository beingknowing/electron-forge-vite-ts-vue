import "reflect-metadata"

import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { app, BrowserWindow, ipcMain, powerMonitor, shell } from 'electron';
import path from 'path';
import dotenv from '@dotenvx/dotenvx';
// import unhandled from 'electron-unhandled';

// unhandled();
// 加载加密的环境变量
const env = process.env.NODE_ENV || 'development';
const envFiles = ['.env', `.env.${env}`,];

// 使用 dotenvx 解密并加载配置（config 是同步函数，不需要 await）
dotenv.config({
  path: envFiles,
  override: true,
})

console.log(`Running in ${env} mode`, process.env.sn_host);

// 拦截所有链接，在系统默认浏览器中打开
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (url.includes('localhost'))
      return;
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


/**
 * 创建并返回一个指定路由路径的浏览器窗口
 * @param {string} [routePath='/'] - 要加载的路由路径，默认为根路径
 * @returns {BrowserWindow} 新创建的浏览器窗口实例
 * @throws {Error} 当开发环境下 ELECTRON_RENDERER_URL 未定义时抛出错误
 */
function createRouteWindow(routePath: string = '/') {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
    }
  })

  // 拼接 URL：开发环境下带 Hash，生产环境下指向 index.html 的 Hash
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#${routePath}`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: routePath })
  }

  return win
}
/**
 * 创建并配置主浏览器窗口
 * @param {string} [routePath='/'] - 路由路径，用于开发环境和生产环境下的URL拼接
 * @description 
 * - 创建具有默认配置的浏览器窗口
 * - 根据环境变量加载不同URL（开发环境使用Vite服务器URL，生产环境加载本地HTML文件）
 * - 添加窗口就绪显示事件监听
 * - 添加电源状态变化监听（恢复/挂起）
 */
const createWindow = (routePath: string = '/') => {

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
  // if (INDEX_VITE_DEV_SERVER_URL) {
  //   mainWindow.loadURL(INDEX_VITE_DEV_SERVER_URL);
  // } else {

  //   mainWindow.loadFile(path.join(__dirname, `../renderer/${INDEX_VITE_NAME}.html`));
  // }
  // 拼接 URL：开发环境下带 Hash，生产环境下指向 index.html 的 Hash
  // console.log("🚀 ~ createWindow ~ global[INDEX_VITE_DEV_SERVER_URL]:", this["INDEX_VITE_DEV_SERVER_URL"])
  console.log("🚀 ~ createWindow ~ INDEX_VITE_DEV_SERVER_URL:", INDEX_VITE_DEV_SERVER_URL)
  if (INDEX_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(`${INDEX_VITE_DEV_SERVER_URL}/#${routePath}`)
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${INDEX_VITE_NAME}.html`), { hash: routePath })
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
  ipcMain.handle('get-domain-user', ticketController.getUserName);

  // ipcMain.handle()
}) 
