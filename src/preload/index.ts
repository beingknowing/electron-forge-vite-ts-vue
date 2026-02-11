import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// import Store from 'secure-electron-store'
// import fs from 'fs'
// const store = new Store<ConfigArray>({
//     name: 'config',
//     encryptionKey: '123456'
// })
// // Custom APIs for renderer
const api = {
    // store: store.preloadBindings(ipcRenderer, fs)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
        contextBridge.exposeInMainWorld('env', process.env)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api

    window.env = process.env
}