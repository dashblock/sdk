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

    async set(config: { device?: 'desktop' | 'mobile', proxy?: 'datacenter' | 'none' }) {
        return this.client.send("set", config)
    }

    async collect(schema: any) {
        return this.client.send("collect", { schema: schema })
    }

    async click(selection: any) {
        return this.client.send("click", selection)
    }

    async clickAll(selection: any) {
        return this.client.send("clickAll", selection)
    }

    async input(selection: any, value: string) {
        return this.client.send("input", { css: selection.css, value: value })
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

    async close() {
        return this.client.close()
    }
}