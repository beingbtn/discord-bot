import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';
import { Listener } from '@sapphire/framework';

export class WarnListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: 'warn',
        });
    }

    public run(info: string) {
        this.container.logger.warn(
            this.container.i18n.getMessage('eventsWarn'),
            info,
        );

        new Sentry()
            .setSeverity(Severity.Warning)
            .captureException(info);
    }
}