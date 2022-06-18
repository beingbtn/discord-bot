import {
    type FileOptions,
    SnowflakeUtil,
} from 'discord.js';
import { Base } from '../structures/Base';
import { generateStackTrace } from '../utility/utility';
import { i18n } from '../locales/i18n';
import { Sentry } from './Sentry';

export class BaseErrorHandler<E> extends Base {
    readonly error: E;

    readonly incidentID: string;

    readonly sentry: Sentry;

    readonly stackAttachment: FileOptions;

    i18n: i18n;

    public constructor(error: E) {
        super();

        this.error = error;
        this.i18n = new i18n();
        this.incidentID = SnowflakeUtil.generate();
        this.sentry = new Sentry().baseErrorContext(this.incidentID);

        Object.defineProperty(
            error,
            'fullStack',
            {
                value: generateStackTrace(),
            },
        );

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

    public log(...text: unknown[]) {
        const id = `${this.incidentID} |`;

        this.container.logger.error(id, ...text);
    }
}