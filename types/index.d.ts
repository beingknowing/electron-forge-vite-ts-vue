
export interface ConfigType {
    isCurrent: boolean;
    client_secret: string;
    client_id: string;
    sn_host: string;
}

export interface ConfigsType extends Array<ConfigType> { }


