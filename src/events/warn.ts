import type { EventStatic } from '../@types/Event';
import { client } from '../main';
import { Log } from '../utility/Log';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export default class implements EventStatic {
    static event = 'warn';
    static once = false;

    static execute(info: string) {
        Log.error(
            client.i18n.getMessage('eventsWarn'),
            info,
        );

        new Sentry()
            .setSeverity(Severity.Warning)
            .captureException(info);
    }
}