import { Client } from "./client";
import { EventEmitter } from "events";

export class Dashblock extends EventEmitter {
    
    client: Client;

    constructor(client: Client) {
        super()
        this.client = client;
        this.on('newListener', async (evtName: string, cb: Function) => {
            this.client.on(evtName, (...args) => {
                cb(...args)
            })
        })
    }
    
    static async connect(address: string, options: { api_key: string }) {
        var client = await Client.connect(address, options)
        return new Dashblock(client)
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