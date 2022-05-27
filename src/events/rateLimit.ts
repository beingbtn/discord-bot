import type { RateLimitData } from 'discord.js';
import { Log } from '../utility/Log';
import { Sentry } from '../errors/Sentry';
import { Severity } from '@sentry/node';
import { EventStatic } from '../@types/Event';
import { client } from '../main';

export class Event implements EventStatic {
    static event = 'rateLimit';
    static once = false;

    static execute(rateLimitInfo: RateLimitData) {
        Log.error(
            client.i18n.getMessage('eventsRateLimit'),
            rateLimitInfo,
        );

        new Sentry()
            .setSeverity(Severity.Warning)
            .captureException(rateLimitInfo);
    }
}