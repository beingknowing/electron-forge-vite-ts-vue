import "reflect-metadata"
import { app, BrowserWindow, ipcMain, powerMonitor } from 'electron';
import path from 'path';
import { startServer } from './server';

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
    width: 1024,
    height: 900,
    center: true,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload','index.js'),
    },
    // have no visual flash (1)
    show: true,
    backgroundColor: 'hsl(180, 80%, 58%)'
  });
  mainWindow.webContents.openDevTools();
  // and load the index.html of the app.
  console.log("🚀 ~ createWindow ~ INDEX_VITE_NAME:", INDEX_VITE_NAME)
  if (INDEX_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(INDEX_VITE_DEV_SERVER_URL);
  } else {

    mainWindow.loadFile(path.join(__dirname, `../renderer/src/renderer/index.html`));


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
  console.log("🚀 ~ createWindow ~ INDEX_VITE_DEV_SERVER_URL:", INDEX_VITE_DEV_SERVER_URL)
  console.log("🚀 ~ createWindow ~ INDEX_VITE_NAME:", INDEX_VITE_NAME)
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

app.whenReady().then(_v => {
  ipcMain.on('ticket', (event, ticket) => {
    console.log("🚀 ~ ticket:", ticket)

  })
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
