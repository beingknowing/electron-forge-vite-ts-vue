interface TicketType {
    title: string;
    content: string;
    queue_val: string;
    userName?: string;
}

interface ClientCredential {
    "access_token": string,
    "scope": string,
    "token_type": string,
    "expires_in": int
}

interface TicketResponse {
    "import_set": string;//"ISET0293839",
    "staging_table": string;// "u_create_incident_inbound",
    "result": TicketResult[];
}
interface TicketResult {
    "transform_map": string;//"PFE_Create_Incident_inbound",
    "table": string;// "incident",
    "display_name": string;// "number",
    "display_value": string;// "INC02530827",
    "record_link": string;// "https://pfetst.service-now.com/api/now/table/incident/15aff0c01bbaf21076c00dc5604bcb9e",
    "status": string; //"inserted",
    "sys_id": string;// "15aff0c01bbaf21076c00dc5604bcb9e"
}