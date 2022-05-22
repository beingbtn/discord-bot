import type { ClientEvent } from '../@types/client';
import { client } from '../main';
import { Log } from '../utility/Log';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';

export const properties: ClientEvent['properties'] = {
    name: 'error',
    once: false,
};

export const execute: ClientEvent['execute'] = (error: Error): void => {
    Log.error(
        client.i18n.getMessage('eventsError'),
        error,
    );

    new Sentry()
        .setSeverity(Severity.Error)
        .captureException(error);
};