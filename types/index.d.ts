import type { IpcMainInvokeEvent } from 'electron'

type MainHandlerMap = typeof import('../src/main/handlers').default

type HandlerArguments<T> = T extends (event: IpcMainInvokeEvent, ...args: infer Rest) => any ? Rest : Parameters<T>
type HandlerReturn<T> = T extends (...args: any[]) => infer R ? Promise<Awaited<R>> : never

export type IpcInvokeMap = {
    [K in keyof MainHandlerMap]: (...args: HandlerArguments<MainHandlerMap[K]>) => HandlerReturn<MainHandlerMap[K]>
}

declare global {
    interface Window {
        ipcInvoke: IpcInvokeMap
    }
}

export * from './orm_types'