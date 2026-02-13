import ticket from "./ticketHandler";
import credential from "./credentialHandler";
const handlers = {
    ...ticket, ...credential
} as const;

export type IpcHandlerMap = typeof handlers;

export default handlers;

