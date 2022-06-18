import { Listener } from '@sapphire/framework';
import { Events } from '../enums/Events';
import { Sentry } from '../errors/Sentry';

export class RateLimitListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.RateLimit,
        });
    }

    public run(rateLimitInfo: string) {
        this.container.logger.warn(
            this.container.i18n.getMessage('eventsRateLimit'),
            rateLimitInfo,
        );

        new Sentry()
            .setSeverity('warning')
            .captureException(rateLimitInfo);
    }
}