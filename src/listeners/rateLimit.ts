import { Listener } from '@sapphire/framework';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export class RateLimitListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: 'rateLimit',
        });
    }

    public run(rateLimitInfo: string) {
        this.container.logger.debug(
            this.container.i18n.getMessage('eventsRateLimit'),
            rateLimitInfo,
        );

        new Sentry()
            .setSeverity(Severity.Warning)
            .captureException(rateLimitInfo);
    }
}