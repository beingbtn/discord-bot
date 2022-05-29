import { Listener } from '@sapphire/framework';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export class RateLimitListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: 'error',
        });
    }

    public run(error: Error) {
        this.container.logger.error(
            this.container.i18n.getMessage('eventsError'),
            error,
        );

        new Sentry()
            .setSeverity(Severity.Error)
            .captureException(error);
    }
}