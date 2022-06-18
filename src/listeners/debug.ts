import { Listener } from '@sapphire/framework';
import { Events } from '../enums/Events';
import { Sentry } from '../errors/Sentry';

export class RateLimitListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.Debug,
        });
    }

    public run(info: string) {
        return;
        this.container.logger.debug(
            this.container.i18n.getMessage('eventsDebug'),
            info,
        );

        new Sentry()
            .setSeverity('debug')
            .captureMessages(info);
    }
}