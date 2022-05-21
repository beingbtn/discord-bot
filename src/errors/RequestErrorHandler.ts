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
            .setTitle(this.i18n.getMessage(
                'errorsCoreRequestStatusTitle',
            ))
            .addFields(
                {
                    name: this.i18n.getMessage(
                        'errorsCoreRequestStatusType',
                    ),
                    value: this.error instanceof Error
                        ? this.error.name
                        : this.i18n.getMessage('null'),
                },
                {
                    name: this.i18n.getMessage(
                        'errorsCoreRequestStatusResumeName',
                    ),
                    value: cleanLength(
                        this.core.error.getTimeout() - Date.now(),
                    ) ?? this.i18n.getMessage('null'),
                },
                {
                    name: this.i18n.getMessage(
                        'errorsCoreRequestStatusLastMinuteName',
                    ),
                    value: this.i18n.getMessage(
                        'errorsCoreRequestStatusLastMinuteValue',
                        [
                            abort.lastMinute,
                            generic.lastMinute,
                            http.lastMinute,
                        ],
                    ),
                },
                {
                    name: this.i18n.getMessage(
                        'errorsCoreRequestStatusNextTimeoutsName',
                    ),
                    value: this.i18n.getMessage(
                        'errorsCoreRequestStatusNextTimeoutsValue',
                        [
                            cleanLength(abort.timeout) ??
                                this.i18n.getMessage('null'),
                            cleanLength(generic.timeout) ??
                                this.i18n.getMessage('null'),
                            cleanLength(http.timeout) ??
                                this.i18n.getMessage('null'),
                        ],
                    ),
                },
                {
                    name: this.i18n.getMessage(
                        'errorsCoreRequestStatusUsesName',
                    ),
                    value: String(uses),
                },
            );

        return embed;
    }

    private async systemNotify() {
        const embed = this.statusEmbed();

        if (this.error instanceof AbortError) {
            if (this.timeout !== null) {
                embed.setDescription(this.i18n.getMessage(
                    'errorsCoreRequestSystemAbortErrorErrorDescription',
                ));
            }
        } else if (this.error instanceof HTTPError) {
            embed
                .setDescription(this.i18n.getMessage(
                    'errorsCoreRequestSystemHTTPErrorErrorDescription',
                ))
                .addFields({
                    name: this.i18n.getMessage(
                        'errorsCoreRequestSystemHTTPErrorErrorStatusName',
                    ),
                    value: String(this.error.status),
                });
        } else if (this.error instanceof FetchError) {
            embed.setDescription(this.i18n.getMessage(
                'errorsCoreRequestSystemFetchErrorDescription',
            ));
        } else {
            embed.setTitle(this.i18n.getMessage(
                'errorsGeneralUnexpected',
            ));
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