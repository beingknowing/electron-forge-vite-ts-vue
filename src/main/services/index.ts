import { createServices, MergeIpcService } from 'electron-ipc-decorator'
import { AppService } from './app-service'


import 'reflect-metadata';
// 自动导入 handlers 目录下的所有模块（eager: true 强制立即执行）
// const modules = import.meta.glob(['./handlers/*Service*.ts', './handlers/*service*.ts'], { eager: true });
// console.log("🚀 ~ modules:", modules)
// const moduleValues = Object.values(modules);
// console.log("🚀 ~ moduleValues:", moduleValues)
// Create services with automatic type inference
export const services = createServices([AppService])

// Generate type definition for all services
export type IpcServices = MergeIpcService<typeof services>
