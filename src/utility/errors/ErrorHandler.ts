import type { WebhookConfig } from '../../@types/client';
import { BaseErrorHandler } from './BaseErrorHandler';
import { sendWebHook } from '../utility';
import process from 'node:process';

export class ErrorHandler<E> extends BaseErrorHandler<E> {
    data: string[];

    constructor(error: E, ...data: string[]) {
        super(error);
        this.data = data;
    }

    static async init<T>(error: T, ...data: string[]) {
        const handler = new ErrorHandler(error, ...data);
        handler.errorLog();
        await handler.systemNotify();
    }

    private errorLog() {
        this.log(this.error);

        if (this.data.length > 0) {
            this.log('Extra data:', ...this.data);
        }
    }

    async systemNotify() {
        await sendWebHook({
            content: `<@${(JSON.parse(process.env.OWNERS!)).join('><@')}>`,
            embeds: [this.errorEmbed()],
            files: [this.stackAttachment],
            webhook: JSON.parse(process.env.WEBHOOK_FATAL!) as WebhookConfig,
            suppressError: true,
        });
    }
}