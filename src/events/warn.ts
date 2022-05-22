import type { ClientEvent } from '../@types/client';
import { client } from '../main';
import { Log } from '../utility/Log';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export const properties: ClientEvent['properties'] = {
    name: 'warn',
    once: false,
};

export const execute: ClientEvent['execute'] = (info: string): void => {
    Log.error(
        client.i18n.getMessage('eventsWarn'),
        info,
    );

    new Sentry()
        .setSeverity(Severity.Warning)
        .captureException(info);
};