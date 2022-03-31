"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;
const Constants_1 = require("../utility/Constants");
const changes_1 = require("./changes");
const error_1 = require("./error");
const request_1 = require("./request");
const ErrorHandler_1 = require("../utility/errors/ErrorHandler");
const promises_1 = require("node:timers/promises");
const format_1 = require("./format");
const HTTPError_1 = require("../utility/errors/HTTPError");
const RequestErrorHandler_1 = require("../utility/errors/RequestErrorHandler");
const dispatch_1 = require("./dispatch");
const Log_1 = require("../utility/Log");
class Core {
    constructor(client) {
        this.client = client;
        this.performance = {
            latest: null,
            history: [],
        };
        this.dispatch = new dispatch_1.CoreDispatch(this.client);
        this.error = new error_1.CoreError();
        this.request = new request_1.CoreRequest(this.client);
        this.uses = 0;
    }
    async init() {
        while (true) {
            try {
                await this.checkSystem();
            }
            catch (error) {
                await ErrorHandler_1.ErrorHandler.init(error);
            }
        }
    }
    async checkSystem() {
        if (this.error.isTimeout()) {
            await (0, promises_1.setTimeout)(this.error.getTimeout());
        }
        if (this.client.config.core === false) {
            await (0, promises_1.setTimeout)(2500);
            return;
        }
        const urls = Constants_1.Constants.urls.rss;
        if (urls.length === 0) {
            await (0, promises_1.setTimeout)(2500);
            return;
        }
        await this.refresh(urls);
    }
    async refresh(urls) {
        for (const url of urls) {
            const performance = {
                ...Constants_1.Constants.defaults.performance,
                start: Date.now(),
                uses: this.uses,
            };
            try {
                const xmlString = await this.request.request(url);
                performance.fetch = Date.now();
                const rssJSON = format_1.CoreFormat.parse(xmlString);
                performance.parse = Date.now();
                const changes = await changes_1.CoreChanges.check(rssJSON);
                performance.check = Date.now();
                if (changes.items.length > 0) {
                    Log_1.Log.log(`New link(s) found: ${changes.items.map(item => item.link).join(', ')}!`);
                    await this.dispatch.dispatch(rssJSON);
                    Log_1.Log.log(`Finished dispatching messages from ${changes.title}!`);
                }
                performance.send = Date.now();
                this.uses += 1;
                this.updatePerformance(performance);
            }
            catch (error) {
                if (error instanceof HTTPError_1.HTTPError) {
                    await RequestErrorHandler_1.RequestErrorHandler.init(error, this);
                    await (0, promises_1.setTimeout)(this.client.config.interval);
                    return;
                }
                this.error.addGeneric();
                await ErrorHandler_1.ErrorHandler.init(error);
                await (0, promises_1.setTimeout)(this.client.config.interval);
                return;
            }
            await (0, promises_1.setTimeout)(this.client.config.interval /
                Constants_1.Constants.urls.rss.length);
        }
    }
    updatePerformance(performance) {
        //Turns the ms since the Jan 1st 1970 into relative
        performance.total = performance.send - performance.start;
        performance.send -= performance.check;
        performance.check -= performance.parse;
        performance.parse -= performance.fetch;
        performance.fetch -= performance.start;
        this.performance.latest = performance;
        const { history } = this.performance;
        if (history[0]?.start + Constants_1.Constants.ms.hour > Date.now())
            return;
        history.unshift(performance);
        history.splice(Constants_1.Constants.limits.performanceHistory);
    }
}
exports.Core = Core;
