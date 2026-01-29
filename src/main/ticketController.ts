
import type { IpcMainInvokeEvent } from 'electron'
import { submitTicket } from './ticket' 
import { getUserName } from './utils'
export default {
    async onTicketSubmit(event: IpcMainInvokeEvent, data: TicketType): Promise<TicketResponse> {
        return await submitTicket(data)
    },
 
    async getUserName(){
        return getUserName()
    }
}
