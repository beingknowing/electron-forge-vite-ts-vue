import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { IpcInvokeMap } from '../../types'
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

const buildIpcInvokeBridge = async (): Promise<IpcInvokeMap> => {
    const handlerNames = await ipcRenderer.invoke('getIpcHandlerForPreload') as Array<keyof IpcInvokeMap>
    const invokeMap: Partial<IpcInvokeMap> = Object.create(null)

    const createInvoker = <K extends keyof IpcInvokeMap>(channel: K): IpcInvokeMap[K] => {
        return ((...args: Parameters<IpcInvokeMap[K]>) => ipcRenderer.invoke(channel, ...args)) as IpcInvokeMap[K]
    }

    handlerNames.forEach((channel) => {
        invokeMap[channel] = createInvoker(channel)
    })

    return invokeMap as IpcInvokeMap
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        contextBridge.exposeInMainWorld('api', api);
        contextBridge.exposeInMainWorld('env', process.env);
        void (async () => {
            const ipcInvoke = await buildIpcInvokeBridge()
            contextBridge.exposeInMainWorld('ipcInvoke', ipcInvoke)
        })()
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api

    window.env = process.env
    void (async () => {
        window.ipcInvoke = await buildIpcInvokeBridge()
    })()
}