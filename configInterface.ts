import { singleRconCommmandInterface } from "./singlerconCommandInterface";

export interface configInterface {
    database: {
        host: string,
        user: string,
        schema: string,
        database: string,
        password: string
    },
    rcon: {
        host: string,
        port: string,
        password: number,
        commands: singleRconCommmandInterface[]
    },
    application: {
        applications_category_id: string,
        message_start: string,
        message_end: string,
        types: object
    },
    token: string,
    prefix: string,
    icon: string,
    server_name: string
}