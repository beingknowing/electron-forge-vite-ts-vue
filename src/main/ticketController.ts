
import type { IpcMainInvokeEvent } from 'electron'
import { submitTicket } from './ticket'
import os from 'os';
export default {
    async onTicketSubmit(event: IpcMainInvokeEvent, data: TicketType): Promise<TicketResponse> {
        return await submitTicket(data)
    },

    async getDomainUser() {
        const domain = process.env.USERDOMAIN || '';
        const username = process.env.USERNAME || os.userInfo().username;
        return domain ? `${domain}\\${username}` : username;
    }
}
