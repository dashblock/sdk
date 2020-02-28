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
    selection?: Selection,
    schema?: Schema
}[]

export class Dashblock extends EventEmitter {
    
    client: Client;
    logLevel: number;

    private constructor(client: Client) {
        super()
        this.client = client;
        this.client.on("event", (evtName, params) => {
            this.emit(evtName, params)
        })
        this.client.on("error", (error) => {
            this.emit("error", error)
        })
        this.on('newListener', async (evtName: string, cb: Function) => {
            switch (evtName) {
                case "frame":
                    return this.client.send("enableFrame", { enabled: true })
                default:
                    return
            }
        })
    }

    static async connect(options: { api_key: string, endpoint?: string, log_level?: string }) {
        var self = this
        logger.setLevel(options.log_level)
        var endpoint = options.endpoint || "wss://beta.dashblock.com"
        var client = await Client.connect(endpoint, options)
        //@ts-ignore
        var dk = new self.prototype.constructor(client)
        return dk
    }

    async set(config: { device?: 'desktop' | 'mobile', proxy?: 'none' | string, block?: ('script' | 'style' | 'vendor')[], country: string}) {
        return this.client.send("set", config)
    }

    async collect(schema: Schema) {
        return this.client.send("collect", { schema: schema })
    }

    async click(selection: Selection) {
        return this.client.send("click", selection)
    }

    async clickAll(selection: Selection) {
        return this.client.send("clickAll", selection)
    }

    async input(selection: Selection, value: string) {
        return this.client.send("input", { selection: selection, value: value })
    }

    async submit() {
        return this.client.send("submit", {})
    }

    async describe() {
        return this.client.send("describe", {})
    }

    async goto(url: string, options?: { timeout: number }) {
        return this.client.send("goto", { url: url, ...options })
    }

    async html() {
        return this.client.send("html")
    }

    async sleep(duration: number) {
        return this.client.send("sleep", { duration: duration })
    }

    async close() {
        return this.client.close()
    }
}