"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const BaseErrorHandler_1 = require("./BaseErrorHandler");
const utility_1 = require("../utility");
class ErrorHandler extends BaseErrorHandler_1.BaseErrorHandler {
    constructor(error, ...data) {
        super(error);
        this.data = data;
    }
    static async init(error, ...data) {
        const handler = new ErrorHandler(error, ...data);
        handler.errorLog();
        await handler.systemNotify();
    }
    errorLog() {
        this.log(this.error);
        if (this.data.length > 0) {
            this.log('Extra data:', ...this.data);
        }
    }
    async systemNotify() {
        await (0, utility_1.sendWebHook)({
            content: `<@${(JSON.parse(process.env.OWNERS)).join('><@')}>`,
            embeds: [this.errorEmbed()],
            files: [this.stackAttachment],
            webhook: JSON.parse(process.env.WEBHOOK_FATAL),
            suppressError: true,
        });
    }
}
exports.ErrorHandler = ErrorHandler;
