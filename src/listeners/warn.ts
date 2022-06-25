import { Listener } from '@sapphire/framework';
import { Events } from '../enums/Events';
import { Sentry } from '../structures/Sentry';

export class WarnListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.Warn,
        });
    }

    public run(info: string) {
        this.container.logger.warn(
            this.container.i18n.getMessage('eventsWarn'),
            info,
        );

        new Sentry()
            .setSeverity('warning')
            .captureException(info);
    }
}