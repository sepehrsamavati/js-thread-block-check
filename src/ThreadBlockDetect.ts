import { Callback, ILogger } from "./global.types";

const hasUnref = typeof (setTimeout(() => { }, 1) as any).unref === "function";

export class ThreadBlockDetect {
    static #maxValidDelay = 20;
    static #intervalDelay = 1000;

    #lastCheck = performance.now();
    #interval: number;
    #logger: ILogger = console;
    #callback?: Callback;

    constructor(callback?: Callback, maxValidDelay?: number);
    constructor(logger?: ILogger, maxValidDelay?: number);
    constructor(maxValidDelay?: number);

    constructor(arg1?: unknown, maxValidDelay?: number) {

        if (typeof arg1 === "object") {
            const logger = arg1 as ILogger;
            if ([logger.debug, logger.warn].map(l => typeof l === "function"))
                this.#logger = logger;
        } else if (typeof arg1 === "function") {
            this.#callback = arg1 as Callback;
        }

        let _maxValidDelay: number | null = null;
        if (typeof arg1 === "number" && !Number.isNaN(arg1)) {
            _maxValidDelay = arg1;
        } else if (maxValidDelay && !Number.isNaN(arg1)) {
            _maxValidDelay = maxValidDelay;
        }

        if (_maxValidDelay !== null)
            ThreadBlockDetect.#maxValidDelay = Math.max(
                0,
                Math.min(
                    _maxValidDelay,
                    10_000_000
                )
            );

        this.#logger.debug("✅ Thread block checking started...");

        this.#interval = setInterval(() => { this.#detect() }, ThreadBlockDetect.#intervalDelay) as unknown as number;

        if (hasUnref)
            (this.#interval as any).unref();
    }

    #detect() {
        const delay = performance.now() - this.#lastCheck - ThreadBlockDetect.#intervalDelay;

        if (delay > ThreadBlockDetect.#maxValidDelay) {
            const time = Math.round(delay);
            this.#logger.warn(`⚠ Thread block detected: (${time}ms)`);
            if (this.#callback)
                this.#callback(time);
        }

        this.#lastCheck = performance.now();
    }

    dispose() {
        clearInterval(this.#interval);
    }
}
