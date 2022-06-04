import { Constants } from '../utility/Constants';
import { container } from '@sapphire/framework';
import { CoreChanges } from './CoreChanges';
import { CoreComponents } from './CoreComponents';
import { CoreDispatch } from './CoreDispatch';
import { CoreEmbeds } from './CoreEmbeds';
import { CoreErrors } from './CoreErrors';
import { CoreFormat } from './CoreFormat';
import { CoreRequests } from './CoreRequests';
import { ErrorHandler } from '../errors/ErrorHandler';
import { HTTPError } from '../errors/HTTPError';
import { Log } from '../utility/Log';
import { Options } from '../utility/Options';
import { RequestErrorHandler } from '../errors/RequestErrorHandler';
import { setTimeout } from 'node:timers/promises';
import { Time } from '../enums/Time';

/* eslint-disable no-await-in-loop */

export type Performance = {
    start: number;
    uses: number;
    total: number;
    fetch: number;
    parse: number;
    check: number;
    send: number;
};

export class Core {
    performance: {
        latest: Performance | null;
        history: Performance[];
    };

    changes: CoreChanges;
    components: CoreComponents;
    dispatch: CoreDispatch;
    embeds: CoreEmbeds;
    errors: CoreErrors;
    format: CoreFormat;
    request: CoreRequests;

    uses: number;

    public constructor() {
        this.performance = {
            latest: null,
            history: [],
        };

        this.changes = new CoreChanges();
        this.components = new CoreComponents();
        this.dispatch = new CoreDispatch();
        this.embeds = new CoreEmbeds();
        this.errors = new CoreErrors();
        this.format = new CoreFormat();
        this.request = new CoreRequests();

        this.uses = 0;
    }

    public async init() {
        while (true) {
            try {
                await this.checkSystem();
            } catch (error) {
                new ErrorHandler(error).init();
            }
        }
    }

    private async checkSystem() {
        if (this.errors.isTimeout()) {
            await setTimeout(this.errors.getTimeout());
        }

        if (container.config.core === false) {
            await setTimeout(Options.coreDisabledTimeout);
            return;
        }

        const urls = Constants.rss;

        if (urls.length === 0) {
            await setTimeout(Options.coreDisabledTimeout);
            return;
        }

        await this.refresh(urls);
    }

    private async refresh(urls: string[]) {
        for (const url of urls) {
            const performance: Performance = {
                start: Date.now(),
                uses: this.uses,
                total: NaN,
                fetch: NaN,
                parse: NaN,
                check: NaN,
                send: NaN,
            };

            try {
                const xmlString = await this.request.request(url);
                performance.fetch = Date.now();

                const rssJSON = this.format.parse(xmlString);
                performance.parse = Date.now();

                const changes = await this.changes.check(rssJSON);
                performance.check = Date.now();

                if (changes.items.length > 0) {
                    const newPosts = changes.items.filter(
                        item => item.edited === false,
                    );

                    const editedPosts = changes.items.filter(
                        item => item.edited === true,
                    );

                    Log.core(
                        container.i18n.getMessage(
                            'coreCoreLogNewPosts', [
                            newPosts.length,
                            newPosts.map(post => post.link).join(', '),
                        ],
                    ));

                    Log.core(
                        container.i18n.getMessage(
                            'coreCoreLogEditedPosts', [
                            editedPosts.length,
                            editedPosts.map(post => post.link).join(', '),
                        ],
                    ));

                    const embeds = this.embeds.create(changes);
                    const components = this.components.create(changes);
                    await this.dispatch.dispatch(embeds, components, changes);

                    Log.core(
                        container.i18n.getMessage(
                            'coreCoreLogFinishedPosts', [
                            changes.title,
                        ],
                    ));
                }

                performance.send = Date.now();

                this.uses += 1;

                this.updatePerformance(performance);
            } catch (error) {
                if (error instanceof HTTPError) {
                    new RequestErrorHandler(error, this).init();
                } else {
                    this.errors.addGeneric();
                    new ErrorHandler(error).init();
                }

                const regularInterval = (
                    container.config.interval /
                    Constants.rss.length
                );

                if (regularInterval > this.errors.getTimeout()) {
                    await setTimeout(regularInterval);
                }

                return;
            }

            await setTimeout(
                container.config.interval /
                Constants.rss.length,
            );
        }
    }

    private updatePerformance(performance: Performance) {
        //Turns the ms since the Jan 1st 1970 into relative
        performance.total = performance.send - performance.start;
        performance.send -= performance.check;
        performance.check -= performance.parse;
        performance.parse -= performance.fetch;
        performance.fetch -= performance.start;

        this.performance.latest = performance;

        const { history } = this.performance;

        if (history[0]?.start + Time.Hour > Date.now()) return;

        history.unshift(performance);

        history.splice(Options.performanceHistory);
    }
}