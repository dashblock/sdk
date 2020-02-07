import { Client } from "./client";
import { EventEmitter } from "events";
import { logger } from "./logger";

export type Selection = {
    css?: string,
    content?: string
}

export type Schema = {
    name: string,
    format?: string,
    value?: {
        style?: string,
        attribute?: string,
        content?: number
    },
    selection: Selection
}[]

export class Dashblock extends EventEmitter {
    
    client: Client;
    logLevel: number;

    private constructor(client: Client) {
        super()
        this.client = client;
        this.on('newListener', async (evtName: string, cb: Function) => {
            this.client.on(evtName, (...args) => {
                cb(...args)
            })
        })
    }

    static async connect(options: { api_key: string, endpoint?: string, log_level?: string }) {
        logger.setLevel(options.log_level)
        var endpoint = options.endpoint || "wss://beta.dashblock.com"
        var client = await Client.connect(endpoint, options)
        var dk = new Dashblock(client)
        return dk
    }

    async set(config: { device?: 'desktop' | 'mobile', proxy?: 'datacenter' | 'none' }) {
        return this.client.send("set", config)
    }

    async collect(schema: Schema) {
        return this.client.send("collect", { schema: schema }).catch(this.handleError)
    }

    async click(selection: Selection) {
        return this.client.send("click", selection).catch(this.handleError)
    }

    async clickAll(selection: Selection) {
        return this.client.send("clickAll", selection).catch(this.handleError)
    }

    async input(selection: Selection, value: string) {
        return this.client.send("input", { selection: selection, value: value }).catch(this.handleError)
    }

    async submit() {
        return this.client.send("submit", {}).catch(this.handleError)
    }

    async describe() {
        return this.client.send("describe", {}).catch(this.handleError)
    }

    async goto(url: string, options?: { timeout: number }) {
        return this.client.send("goto", { url: url, ...options }).catch(this.handleError)
    }

    async html() {
        return this.client.send("html").catch(this.handleError)
    }

    async close() {
        return this.client.close()
    }

    private handleError = (e: Error) => {
        this.close()
        throw e
    }
}