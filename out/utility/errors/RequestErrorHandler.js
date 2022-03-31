"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestErrorHandler = void 0;
const AbortError_1 = require("./AbortError");
const BaseErrorHandler_1 = require("../../utility/errors/BaseErrorHandler");
const utility_1 = require("../../utility/utility");
const ErrorHandler_1 = require("../../utility/errors/ErrorHandler");
const node_fetch_1 = require("node-fetch");
const HTTPError_1 = require("./HTTPError");
const owners = JSON.parse(process.env.OWNERS);
class RequestErrorHandler extends BaseErrorHandler_1.BaseErrorHandler {
    constructor(error, core) {
        super(error);
        this.core = core;
        const { error: coreErrors } = this.core;
        if (this.error instanceof AbortError_1.AbortError) {
            coreErrors.addAbort();
        }
        else if (this.error instanceof HTTPError_1.HTTPError) {
            coreErrors.addHTTP();
        }
        else {
            coreErrors.addGeneric();
        }
        const resumeAfter = coreErrors.getTimeout();
        this.timeout = (0, utility_1.cleanLength)(resumeAfter, true);
    }
    static async init(error, core) {
        const handler = new RequestErrorHandler(error, core);
        try {
            handler.errorLog();
            await handler.systemNotify();
        }
        catch (error2) {
            await ErrorHandler_1.ErrorHandler.init(error2, handler.incidentID);
        }
    }
    errorLog() {
        if (this.error instanceof AbortError_1.AbortError) {
            this.log(this.error.name);
        }
        else {
            this.log(this.error);
        }
    }
    statusEmbed() {
        const { error: { abort, generic, http, }, uses, } = this.core;
        const embed = this.baseErrorEmbed()
            .setTitle('Degraded Performance')
            .addFields({
            name: 'Type',
            value: this.error instanceof Error
                ? this.error.name
                : 'Unknown',
        }, {
            name: 'Resuming In',
            value: this.timeout ??
                'Not applicable',
        }, {
            name: 'Last Minute Statistics',
            value: `Abort Errors: ${abort.lastMinute} 
                    HTTP Errors: ${http.lastMinute}
                    Other Errors: ${generic.lastMinute}`,
        }, {
            name: 'Next Timeouts',
            value: `May not be accurate
                     Abort Errors: ${(0, utility_1.cleanLength)(abort.timeout)}
                    HTTP Errors: ${(0, utility_1.cleanLength)(http.timeout)}
                    Other Errors: ${(0, utility_1.cleanLength)(generic.timeout)}`,
        }, {
            name: 'Request',
            value: `Instance Queries: ${uses}`,
        });
        return embed;
    }
    async systemNotify() {
        const embed = this.statusEmbed();
        if (this.error instanceof AbortError_1.AbortError) {
            if (this.timeout !== null) {
                embed
                    .setDescription('A timeout has been applied.');
            }
        }
        else if (this.error instanceof HTTPError_1.HTTPError) {
            embed
                .setDescription('A timeout has been applied.')
                .addFields({
                name: 'Request',
                value: `Status: ${this.error.status}`,
            });
        }
        else if (this.error instanceof node_fetch_1.FetchError) {
            embed
                .setDescription('A timeout has been applied.');
        }
        else {
            embed
                .setTitle('Unexpected Error');
        }
        await (0, utility_1.sendWebHook)({
            content: this.timeout !== null ||
                !(this.error instanceof AbortError_1.AbortError)
                ? `<@${owners.join('><@')}>`
                : null,
            embeds: [embed],
            files: this.error instanceof AbortError_1.AbortError ||
                this.error instanceof HTTPError_1.HTTPError ||
                this.error instanceof node_fetch_1.FetchError
                ? undefined
                : [this.stackAttachment],
            webhook: this.error instanceof HTTPError_1.HTTPError ||
                this.error instanceof node_fetch_1.FetchError
                ? JSON.parse(process.env.WEBHOOK_REQUEST)
                : JSON.parse(process.env.WEBHOOK_FATAL),
            suppressError: true,
        });
    }
}
exports.RequestErrorHandler = RequestErrorHandler;
