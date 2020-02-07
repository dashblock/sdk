import WebSocket from "isomorphic-ws";
import { EventEmitter } from "events";
import { logger } from "./logger";

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
            var headers: any = {}
            logger.debug("[CONNECTION] Connecting to remote browser...")
            headers['Authorization'] = 'Bearer '+options.api_key
            if (options.height) {
                headers['Height'] = options.height
            }
            if (options.width) {
                headers['Width'] = options.width
            }
            var socket = new WebSocket(address, null, {
                headers: headers
            })
            socket.onerror = (err: any) => {
                if (err.message) {
                    logger.error("Unable to connect to browser")
                    reject(err.message)    
                }
                else {
                    reject(`Server ${address} unreachable. Are you sure of the address ?`)
                }
            }
            socket.onopen = () => {
                socket.onmessage = (msg: any) => {
                    try {
                        msg = JSON.parse(msg.data)
                        if (msg.state=='READY') {
                            var client = new Client(socket)
                            logger.info("[CONNECTION] Connected to remote browser")
                            resolve(client)
                        }
                        else if(msg.state=='ERROR') {
                            if (msg.error) {
                                reject(msg.error)
                            }
                            else {
                                reject("Unable to connect")
                            }
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
            logger.debug("[COMMAND] ["+this.currentId+"] Sending command "+method)
            this.callbacks[this.currentId] = (err: any, results: any) => {
                if (err) {
                    logger.error("[COMMAND] ["+this.currentId+"] Command "+method+" failed. Reason: "+err)
                    reject(err)
                }
                else {
                    logger.info("[COMMAND] ["+this.currentId+"] Command "+method+" executed successfully")
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
            logger.error('[ERROR] ', msg.error)
            throw msg.error
        }
        else if (msg.event) {
            logger.info("[EVENT] "+msg.event)
            this.emit(msg.event, msg.data)
        }
        else {
            throw "Unknown error"
        }
    }

    close() {
        logger.info("[CONNECTION] Connection to remote browser closed")
        return this.socket.close()
    }
}