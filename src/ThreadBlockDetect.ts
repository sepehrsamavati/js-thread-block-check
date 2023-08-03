import { Callback, ILogger } from "./global.types";

const hasUnref = typeof (setTimeout(() => { }, 1) as any).unref === "function";

export default class ThreadBlockDetect {
    static #maxValidDelay = 20;
    static #intervalDelay = 1000;

    #lastCheck = performance.now();
    #interval: number | NodeJS.Timeout;
    #logger: ILogger = console;
    #callback?: Callback;

    constructor(callback?: Callback);
    constructor(logger?: ILogger);

    constructor(loggerOrCallback?: unknown) {
        if (typeof loggerOrCallback === "object") {
            const logger = loggerOrCallback as ILogger;
            if ([logger.debug, logger.warn].map(l => typeof l === "function"))
                this.#logger = logger;
        } else if (typeof loggerOrCallback === "function") {
            this.#callback = loggerOrCallback as Callback;
        }

        this.#logger.debug("✅ Thread block checking started...");

        this.#interval = setInterval(() => { this.#check() }, ThreadBlockDetect.#intervalDelay);

        if (hasUnref)
            (this.#interval as any).unref();
    }

    #check() {
        const delay = performance.now() - this.#lastCheck - ThreadBlockDetect.#intervalDelay;

        if (delay > ThreadBlockDetect.#maxValidDelay)
        {
            const time = Math.round(delay);
            this.#logger.warn(`⚠ Thread block detected: (${time}ms)`);
            if(this.#callback)
                this.#callback(time);
        }

        this.#lastCheck = performance.now();
    }

    dispose() {
        clearInterval(this.#interval);
    }
}
