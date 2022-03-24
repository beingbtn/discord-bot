import {
    Client,
    DiscordAPIError,
} from 'discord.js';
import { Constants } from '../utility/Constants';
import { CoreError } from './error';
import { CoreRequest } from './request';
import { ErrorHandler } from '../utility/errors/ErrorHandler';
import { RequestErrorHandler } from '../utility/errors/RequestErrorHandler';
import { setTimeout } from 'node:timers/promises';

/* eslint-disable no-await-in-loop */

export type Performance = typeof Constants.defaults.performance;

export class Core {
    client: Client;
    error: CoreError;
    performance: {
        latest: Performance | null;
        history: Performance[];
    };
    request: CoreRequest;
    uses: number;

    constructor(client: Client) {
        this.client = client;
        this.error = new CoreError();
        this.performance = {
            latest: null,
            history: [],
        };
        this.request = new CoreRequest(this.client);
        this.uses = 0;
    }

    async start() {
        while (true) {
            try {
                await this.checkSystem();
            } catch (error) {
                await ErrorHandler.init(error);
            }
        }
    }

    private async checkSystem() {
        if (this.error.isTimeout()) {
            await setTimeout(this.error.getTimeout());
        }

        if (this.client.config.core === false) {
            await setTimeout(2500);
            return;
        }

        const urls = Constants.urls.rss;

        if (urls.length === 0) {
            await setTimeout(2500);
            return;
        }

        await this.refresh(urls);
    }

    private async refresh(urls: string[]) {
        try {
            await this.request.request(urls)
        } catch (error) {

        }

        const performance = {
            ...Constants.defaults.performance,
            start: Date.now(),
            uses: this.uses,
        };

        this.updatePerformance(performance);

        await setTimeout(1000 * 60 * 10);
    }

    private updatePerformance(performance: Performance) {
        //Turns the ms since the Jan 1st 1970 into relative
        performance.total = performance.send - performance.start;
        performance.send -= performance.check;
        performance.check -= performance.fetch;
        performance.fetch -= performance.start;

        this.performance.latest = performance;

        const { history } = this.performance;

        if (history[0]?.start + Constants.ms.hour > Date.now()) return;

        history.unshift(performance);

        history.splice(Constants.limits.performanceHistory);
    }
}