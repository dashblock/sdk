import WebSocket from "isomorphic-ws";
import { EventEmitter } from "events";

export class Client extends EventEmitter {
    
    socket: WebSocket;
    private currentId: number;
    private callbacks: {[id: string]: Function};

    constructor(socket: WebSocket) {
        super()
        this.currentId = 0;
        this.callbacks = {};
        this.socket = socket;

        socket.onmessage = (msg: any) => {
            try {
                var parsedMsg = JSON.parse(msg.data)
                this.onMessage.bind(this)(parsedMsg)
            }
            catch (e) {
                console.error("Unable to parse msg")
            }
        }
        
        this.on('newListener', (evtName, cb) => {
            switch (evtName) {
                case "frame":
                    return this.send("enableFrame", { enabled: true })
                case "page":
                    return this.send("enablePage", { enabled: true })
                default:
                    throw new Error(`Invalid event ${evtName}`)
            }
        })
    }

    static async connect(address: string, options: any): Promise<Client> {
        return new Promise((resolve, reject) => {
            var socket = new WebSocket(address, null, {
                headers: {
                    'Authorization': 'Bearer '+options.api_key
                }
            })
            socket.onerror = (err: any) => {
                reject(`Server ${address} unreachable. Are you sure of the address ?`)
            }
            socket.onopen = () => {
                socket.onmessage = (msg: any) => {
                    try {
                        msg = JSON.parse(msg.data)
                        if (msg.state=='READY') {
                            var client = new Client(socket)
                            resolve(client)
                        }
                        else if(msg.state=='ERROR') {
                            reject("Unable to connect")
                        }
                    }
                    catch(e) {
                        reject("Unable to connect")
                    }
                }
            }
        })
    }

    async send(method: string, params?: any) {
        return new Promise((resolve, reject) => {
            this.currentId++;
            this.callbacks[this.currentId] = (err: any, results: any) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(results)
                }
            }
            this.socket.send(JSON.stringify({ id: this.currentId, method: method, params: params }))
        })
    }

    onMessage(msg: any) {
        if (msg.id && this.callbacks[msg.id]) {
            this.callbacks[msg.id](msg.error, msg.results)
        }
        else if (msg.error) {
            throw msg.error
        }
        else if (msg.event) {
            this.emit(msg.event, msg.data)
        }
        else {
            throw "Unknown error"
        }
    }

    close() {
        return this.socket.close()
    }
}