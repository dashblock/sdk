import { Client } from "./client";
import { EventEmitter } from "events";

export class Dashblock extends EventEmitter {
    
    client: Client;

    private constructor(client: Client) {
        super()
        this.client = client;
        this.on('newListener', async (evtName: string, cb: Function) => {
            this.client.on(evtName, (...args) => {
                cb(...args)
            })
        })
    }

    static async connect(options: { api_key: string, endpoint?: string, width?: number, height?: number }) {
        var endpoint = options.endpoint || "wss://beta.dashblock.com"
        var client = await Client.connect(endpoint, options)
        return new Dashblock(client)
    }

    async collect(schema: any) {
        return this.client.send("collect", { schema: schema })
    }

    async goto(url: string, options?: { timeout: number }) {
        return this.client.send("goto", { url: url, ...options })
    }

    async html() {
        return this.client.send("html")
    }

    async close() {
        return this.client.close()
    }
}