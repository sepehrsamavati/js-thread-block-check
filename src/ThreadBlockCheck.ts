type Logger = (message: string) => void;

interface ILogger {
    debug: Logger;
    warn: Logger;
}

export default class ThreadBlockCheck {
    #maxValidDelay = 20;
    #intervalDelay = 1000;
    #lastCheck = performance.now();
    #interval = setInterval(() => { this.#check() }, this.#intervalDelay).unref();

    #logger: ILogger = console;

    constructor(logger: ILogger) {
        if([logger.debug, logger.warn].map(l => typeof l === "function"))
            this.#logger = logger;
        this.#logger.debug("✅ Thread block checking started...");
    }

    #check() {
        const delay = performance.now() - this.#lastCheck - this.#intervalDelay;
        if(delay > this.#maxValidDelay)
            this.#logger.warn(`⚠ Thread block detected: (${Math.round(delay)}ms)`);

        this.#lastCheck = performance.now();
    }
}
