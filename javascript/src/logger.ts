export enum LogLevel {
    OFF = 0,
    ERROR = 1,
    INFO = 2,
    DEBUG = 3
}

export class Logger {
    
    level: number

    constructor() {
        this.level = LogLevel.OFF
    }

    error(...args: string[]) {
        if (this.level >= LogLevel.ERROR) {
            console.error(...args)
        }
    }

    info(...args: string[]) {
        if (this.level >= LogLevel.INFO) {
            console.info(...args)
        }
    }

    debug(...args: string[]) {
        if (this.level >= LogLevel.DEBUG) {
            console.debug(...args)
        }
    }

    setLevel(level: string) {
        if (!level) {
            this.level = LogLevel.OFF
            return
        }
        switch (level.toLowerCase()) {
            case "off":
                this.level = LogLevel.OFF
                break
            case "error":
                this.level = LogLevel.ERROR
                break
            case "info":
                this.level = LogLevel.INFO
                break
            case "debug":
                this.level = LogLevel.DEBUG
                break
            default:
                throw new Error("Unrecognized log level. Allowed values are off, error, info, debug.")
        }
    }
}

export var logger = new Logger()