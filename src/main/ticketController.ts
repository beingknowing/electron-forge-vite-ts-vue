
import type { IpcMainEvent } from 'electron'

export default {
    onTicketSubmit(event: IpcMainEvent, data: TicketType) {
        console.log("🚀 ~ TicketController ~ onTicketSubmit ~ data:", data)
        console.log("🚀 ~ TicketController ~ onTicketSubmit ~ event:", event)
    }
}