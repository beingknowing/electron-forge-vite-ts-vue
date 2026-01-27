
import type { IpcMainInvokeEvent } from 'electron'
import { submitTicket } from './ticket'

export default {
    async onTicketSubmit(event: IpcMainInvokeEvent, data: TicketType): Promise<TicketResponse> {
        return await submitTicket(data)
    }
}
