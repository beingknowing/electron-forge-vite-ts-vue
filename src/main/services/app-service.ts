import { app } from 'electron'
import { IpcService, IpcMethod, getIpcContext } from 'electron-ipc-decorator'
import i18n from 'i18next'

interface SearchInput {
    text: string
    options?: Electron.FindInPageOptions
}

export class AppService extends IpcService {
    static readonly groupName = 'app' // Define static group name

    @IpcMethod()
    getAppVersion(): string {
        return app.getVersion()
    }

    @IpcMethod()
    switchAppLocale(locale: string): void {
        i18n.changeLanguage(locale)
        app.commandLine.appendSwitch('lang', locale)
    }

    @IpcMethod()
    async search(input: SearchInput): Promise<Electron.Result | null> {
        try {
            // Context is automatically injected via AsyncLocalStorage
            // Access it using getIpcContext() when needed
            const { sender: webContents } = getIpcContext()

            const { promise, resolve } = Promise.withResolvers<Electron.Result | null>()

            let requestId = -1
            let isResolved = false

            const cleanup = () => {
                if (!isResolved) {
                    webContents.removeListener('found-in-page', handler)
                    isResolved = true
                    resolve(null)
                }
            }

            const handler = (_event: Electron.Event, result: Electron.Result) => {
                if (!isResolved && result.requestId === requestId) {
                    isResolved = true
                    webContents.removeListener('found-in-page', handler)
                    resolve(result)
                }
            }

            webContents.once('found-in-page', handler)

            // Add timeout to prevent memory leaks from hanging searches
            const timeout = setTimeout(() => {
                cleanup()
            }, 5000)

            requestId = webContents.findInPage(input.text, input.options)

            // Clear timeout when promise resolves
            promise.finally(() => {
                clearTimeout(timeout)
                if (!isResolved) {
                    webContents.removeListener('found-in-page', handler)
                }
            })

            return promise
        } catch (error) {
            console.error('Search operation failed:', error)
            return null
        }
    }
}