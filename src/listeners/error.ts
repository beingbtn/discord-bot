import { Listener } from '@sapphire/framework';
import { Events } from '../enums/Events';
import { Sentry } from '../errors/Sentry';

export class RateLimitListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.Error,
        });
    }

    public run(error: Error) {
        this.container.logger.error(
            this.container.i18n.getMessage('eventsError'),
            error,
        );

        new Sentry()
            .setSeverity('error')
            .captureException(error);
    }
}