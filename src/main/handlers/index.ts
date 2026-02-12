import ticket from "./ticketHandler";

const handlers = {
    ...ticket
} as const;

export type IpcHandlerMap = typeof handlers;

export default handlers;

