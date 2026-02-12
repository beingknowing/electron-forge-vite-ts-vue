import { IpcMainInvokeEvent } from "electron"
import { CredentialState } from "../../../types/orm_types"

export default {
    async saveCredential(_event: IpcMainInvokeEvent, data: CredentialState, ...args: any[]): Promise<true> {

        return true
    },

    async ReadCredential(_event: IpcMainInvokeEvent): Promise<CredentialState> {

        return undefined as unknown as CredentialState
    }
}
