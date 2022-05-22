import type { ClientEvent } from '../@types/client';
import { client } from '../main';
import { Log } from '../utility/Log';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export const properties: ClientEvent['properties'] = {
    name: 'debug',
    once: false,
};

export const execute: ClientEvent['execute'] = (info: string): void => {
    return;
    Log.error(
        client.i18n.getMessage('eventsDebug'),
        info,
    );

    new Sentry()
        .setSeverity(Severity.Debug)
        .captureException(info);
};