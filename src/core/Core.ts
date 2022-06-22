import { setTimeout } from 'node:timers/promises';
import { LogLevel } from '@sapphire/framework';
import { Base } from '../structures/Base';
import { Changes } from './Changes';
import { Components } from './Components';
import { Constants } from '../utility/Constants';
import { Dispatch } from './Dispatch';
import { Embeds } from './Embeds';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Errors } from './Errors';
import { Normalize } from './Normalize';
import { HTTPError } from '../errors/HTTPError';
import { Log } from '../structures/Log';
import { Options } from '../utility/Options';
import { RequestErrorHandler } from '../errors/RequestErrorHandler';
import { Requests } from './Requests';
import { Time } from '../enums/Time';
import { Parser } from './Parser';

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

export class Core extends Base {
    readonly performance: {
        latest: Performance | null;
        history: Performance[];
    };

    readonly changes: Changes;

    readonly components: Components;

    readonly dispatch: Dispatch;

    readonly embeds: Embeds;

    readonly errors: Errors;

    readonly format: Normalize;

    readonly parser: Parser;

    readonly requests: Requests;

    uses: number;

    public constructor() {
        super();

        this.performance = {
            latest: null,
            history: [],
        };

        this.changes = new Changes();
        this.components = new Components();
        this.dispatch = new Dispatch();
        this.embeds = new Embeds();
        this.errors = new Errors();
        this.format = new Normalize();
        this.parser = new Parser();
        this.requests = new Requests();

        this.uses = 0;
    }

    public async init() {
        // eslint-disable-next-line no-constant-condition
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

        if (this.container.config.core === false) {
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
        // Array Iterations do not allow async
        // eslint-disable-next-line no-restricted-syntax
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
                const xml = await this.requests.request(url);
                performance.fetch = Date.now();

                const rss = this.parser.parse(xml);

                const rssJSON = this.format.normalize(rss);
                performance.parse = Date.now();

                const changes = await this.changes.check(rssJSON);
                performance.check = Date.now();

                if (changes.items.length > 0) {
                    const newPosts = changes.items.filter(
                        (item) => item.edited === false,
                    );

                    const editedPosts = changes.items.filter(
                        (item) => item.edited === true,
                    );

                    Log.core(
                        LogLevel.Info,
                        this.container.i18n.getMessage(
                            'coreCoreLogNewPosts', [
                                newPosts.length,
                                newPosts.map((post) => post.link).join(', '),
                            ],
                        ),
                    );

                    Log.core(
                        LogLevel.Info,
                        this.container.i18n.getMessage(
                            'coreCoreLogEditedPosts', [
                                editedPosts.length,
                                editedPosts.map((post) => post.link).join(', '),
                            ],
                        ),
                    );

                    const embeds = this.embeds.create(changes);
                    const components = this.components.create(changes);
                    await this.dispatch.dispatch(embeds, components, changes);

                    Log.core(
                        LogLevel.Info,
                        this.container.i18n.getMessage(
                            'coreCoreLogFinishedPosts', [
                                changes.title,
                            ],
                        ),
                    );
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
                    this.container.config.interval
                    / Constants.rss.length
                );

                if (regularInterval > this.errors.getTimeout()) {
                    await setTimeout(regularInterval);
                }

                return;
            }

            await setTimeout(
                this.container.config.interval
                / Constants.rss.length,
            );
        }
    }

    private updatePerformance(performance: Performance) {
        // Turns the ms since the Jan 1st 1970 into relative
        const copy = performance;
        copy.total = copy.send - copy.start;
        copy.send -= copy.check;
        copy.check -= copy.parse;
        copy.parse -= copy.fetch;
        copy.fetch -= copy.start;

        this.performance.latest = performance;

        const { history } = this.performance;

        if (
            typeof history[0] === 'undefined'
            || history[0].start + Time.Hour > Date.now()
        ) return;

        history.unshift(performance);

        history.splice(Options.performanceHistory);
    }
}