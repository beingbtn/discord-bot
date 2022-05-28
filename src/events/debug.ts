import type { EventStatic } from '../@types/Event';
import { client } from '../main';
import { Log } from '../utility/Log';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export default class implements EventStatic {
    static event = 'debug';
    static once = false;

    static execute(info: string) {
        return;
        Log.error(
            client.i18n.getMessage('eventsDebug'),
            info,
        );

        new Sentry()
            .setSeverity(Severity.Debug)
            .captureMessages(info);
    }
}