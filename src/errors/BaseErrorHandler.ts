import {
    BetterEmbed,
    generateStackTrace,
} from '../utility/utility';
import { Constants } from '../utility/Constants';
import {
    FileOptions,
    SnowflakeUtil,
} from 'discord.js';
import { Log } from '../utility/Log';
import { i18n } from '../locales/i18n';

export class BaseErrorHandler<E> {
    readonly error: E;
    readonly incidentID: string;
    readonly stackAttachment: FileOptions;
    i18n: i18n;

    constructor(error: E) {
        this.error = error;

        this.i18n = new i18n();

        this.incidentID = SnowflakeUtil.generate();

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

    baseErrorEmbed() {
        return new BetterEmbed({ text: this.incidentID })
            .setColor(Constants.colors.error);
    }

    errorEmbed() {
        return this.baseErrorEmbed()
            .setTitle(
                this.error instanceof Error
                    ? this.error.name
                    : this.i18n.getMessage('errorsGeneralError'),
            );
    }

    log(...text: unknown[]) {
        const id = `${this.incidentID} |`;

        Log.error(id, ...text);
    }
}