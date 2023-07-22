export type Logger = (message: string) => void;

export type Callback = (time: number) => void;

export interface ILogger {
    debug: Logger;
    warn: Logger;
}
