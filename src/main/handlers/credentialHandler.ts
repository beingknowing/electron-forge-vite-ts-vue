import { IpcMainInvokeEvent } from "electron"
import { CredentialState } from "../../../types/orm_types"
import Store from 'electron-store'

const store = new Store({

});


export default {
    async saveCredential(_event: IpcMainInvokeEvent, data: CredentialState, ...args: any[]): Promise<true> {
        store.set('credential', data)
        return true
    },

    async ReadCredential(_event: IpcMainInvokeEvent): Promise<CredentialState> {
        const credential = store.get('credential') as CredentialState || {}
        return credential
    }
}
