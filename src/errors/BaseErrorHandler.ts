import { SnowflakeUtil } from 'discord.js';
import { i18n } from '../locales/i18n';
import { Base } from '../structures/Base';
import { Sentry } from '../structures/Sentry';

export class BaseErrorHandler<E> extends Base {
    readonly error: E;

    readonly incidentID: string;

    readonly sentry: Sentry;

    i18n: i18n;

    public constructor(error: E) {
        super();

        this.error = error;
        this.i18n = new i18n();
        this.incidentID = SnowflakeUtil.generate();
        this.sentry = new Sentry().baseErrorContext(this.incidentID);
    }

    public log(...text: unknown[]) {
        this.container.logger.error(
            `Incident ${this.incidentID}`,
            ...text,
        );
    }
}