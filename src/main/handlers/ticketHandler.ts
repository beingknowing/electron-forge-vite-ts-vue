
import type { IpcMainInvokeEvent } from 'electron'
import { submitTicket } from './ticketUtil'
import { getUserName } from '../utils'
import { TicketType, TicketResponse } from '../../../types/orm_types'

export default {
    async onTicketSubmit(_event: IpcMainInvokeEvent, data: TicketType): Promise<TicketResponse> {
        return await submitTicket(data)
    },

    async getUserName(_event: IpcMainInvokeEvent) {
        return getUserName()
    }
}
