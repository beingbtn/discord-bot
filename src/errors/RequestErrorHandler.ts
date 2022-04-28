import type { WebhookConfig } from '../@types/client';
import { AbortError } from './AbortError';
import { BaseErrorHandler } from './BaseErrorHandler';
import {
    cleanLength,
    sendWebHook,
} from '../utility/utility';
import { Core } from '../core/core';
import { ErrorHandler } from './ErrorHandler';
import { FetchError } from 'node-fetch';
import { HTTPError } from './HTTPError';
import process from 'node:process';

const owners = JSON.parse(process.env.OWNERS!) as string[];

export class RequestErrorHandler<E> extends BaseErrorHandler<E> {
    readonly core: Core;
    readonly timeout: string | null;

    constructor(error: E, core: Core) {
        super(error);
        this.core = core;

        const { error: coreErrors } = this.core;

        if (this.error instanceof AbortError) {
            coreErrors.addAbort();
        } else if (this.error instanceof HTTPError) {
            coreErrors.addHTTP();
        } else {
            coreErrors.addGeneric();
        }

        const resumeAfter = coreErrors.getTimeout();

        this.timeout = cleanLength(resumeAfter, true);
    }

    static async init<T>(error: T, core: Core) {
        const handler = new RequestErrorHandler(error, core);

        try {
            handler.errorLog();
            await handler.systemNotify();
        } catch (error2) {
            await ErrorHandler.init(error2, handler.incidentID);
        }
    }

    private errorLog() {
        if (this.error instanceof AbortError) {
            this.log(this.error.name);
        } else {
            this.log(this.error);
        }
    }

    private statusEmbed() {
        const {
            error: {
                abort,
                generic,
                http,
            },
            uses,
        } = this.core;

        const embed = this.baseErrorEmbed()
            .setTitle('Degraded Performance')
            .addFields(
                {
                    name: 'Type',
                    value: this.error instanceof Error
                        ? this.error.name
                        : 'Unknown',
                },
                {
                    name: 'Resuming In',
                    value: this.timeout ??
                        'Not applicable',
                },
                {
                    name: 'Last Minute Statistics',
                    value: `Abort Errors: ${abort.lastMinute} 
                    HTTP Errors: ${http.lastMinute}
                    Other Errors: ${generic.lastMinute}`,
                },
                {
                    name: 'Next Timeouts',
                    value: `May not be accurate
                     Abort Errors: ${cleanLength(
                        abort.timeout,
                    )}
                    HTTP Errors: ${cleanLength(
                        http.timeout,
                    )}
                    Other Errors: ${cleanLength(
                        generic.timeout,
                    )}`,
                },
                {
                    name: 'Uses',
                    value: String(uses),
                },
            );

        return embed;
    }

    private async systemNotify() {
        const embed = this.statusEmbed();

        if (this.error instanceof AbortError) {
            if (this.timeout !== null) {
                embed
                    .setDescription('A timeout has been applied.');
            }
        } else if (this.error instanceof HTTPError) {
            embed
                .setDescription('A timeout has been applied.')
                .addFields({
                    name: 'Request',
                    value: `Status: ${this.error.status}`,
                });
        } else if (this.error instanceof FetchError) {
            embed
                .setDescription('A timeout has been applied.');
        } else {
            embed
                .setTitle('Unexpected Error');
        }

        await sendWebHook({
            content:
                this.timeout !== null ||
                !(this.error instanceof AbortError)
                    ? `<@${owners.join('><@')}>`
                    : null,
            embeds: [embed],
            files:
                this.error instanceof AbortError ||
                this.error instanceof HTTPError ||
                this.error instanceof FetchError
                    ? undefined
                    : [this.stackAttachment],
            webhook:
                this.error instanceof HTTPError ||
                this.error instanceof FetchError
                    ? JSON.parse(process.env.WEBHOOK_REQUEST!) as WebhookConfig
                    : JSON.parse(process.env.WEBHOOK_FATAL!) as WebhookConfig,
            suppressError: true,
        });
    }
}