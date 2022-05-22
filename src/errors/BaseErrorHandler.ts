import {
    generateStackTrace,
} from '../utility/utility';
import {
    FileOptions,
    SnowflakeUtil,
} from 'discord.js';
import { i18n } from '../locales/i18n';
import { Log } from '../utility/Log';
import { Sentry } from './Sentry';

export class BaseErrorHandler<E> {
    readonly error: E;
    readonly incidentID: string;
    readonly sentry: Sentry;
    readonly stackAttachment: FileOptions;
    i18n: i18n;

    constructor(error: E) {
        this.error = error;

        this.i18n = new i18n();

        this.incidentID = SnowflakeUtil.generate();

        this.sentry = new Sentry();

        Object.defineProperty(error, 'fullStack', {
            value: generateStackTrace(),
        });

        this.stackAttachment = {
            attachment: Buffer.from(
                JSON.stringify(
                    error,
                    Object.getOwnPropertyNames(error),
                    4,
                ),
            ),
            name: error instanceof Error
                ? `${error.name}.txt`
                : 'error.txt',
        };
    }

    log(...text: unknown[]) {
        const id = `${this.incidentID} |`;

        Log.error(id, ...text);
    }
}