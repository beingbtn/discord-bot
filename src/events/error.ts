import type { EventStatic } from '../@types/Event';
import { client } from '../main';
import { Log } from '../utility/Log';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export default class implements EventStatic {
    static event = 'error';
    static once = false;

    static execute(error: Error) {
        Log.error(
            client.i18n.getMessage('eventsError'),
            error,
        );

        new Sentry()
            .setSeverity(Severity.Error)
            .captureException(error);
    }
}