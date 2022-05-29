import { Listener } from '@sapphire/framework';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export class RateLimitListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: 'debug',
        });
    }

    public run(info: string) {
        return;
        this.container.logger.debug(
            this.container.i18n.getMessage('eventsDebug'),
            info,
        );

        new Sentry()
            .setSeverity(Severity.Debug)
            .captureMessages(info);
    }
}