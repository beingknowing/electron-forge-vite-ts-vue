import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import Store from 'secure-electron-store'
import fs from 'fs'
let store = new Store<ConfigArray>();
// Custom APIs for renderer
const api = {
    store: store.preloadBindings(ipcRenderer, fs)
}

api.store.initial();
api.store.setPasskey('123456');
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