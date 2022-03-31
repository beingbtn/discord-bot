"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseErrorHandler = void 0;
const utility_1 = require("../utility");
const Constants_1 = require("../Constants");
const discord_js_1 = require("discord.js");
const Log_1 = require("../Log");
class BaseErrorHandler {
    constructor(error) {
        this.error = error;
        this.incidentID = discord_js_1.SnowflakeUtil.generate();
        Object.defineProperty(error, 'fullStack', {
            value: (0, utility_1.generateStackTrace)(),
        });
        this.stackAttachment = {
            attachment: Buffer.from(JSON.stringify(error, Object.getOwnPropertyNames(error), 4)),
            name: error instanceof Error
                ? `${error.name}.txt`
                : 'error.txt',
        };
    }
    baseErrorEmbed() {
        return new utility_1.BetterEmbed({ text: this.incidentID })
            .setColor(Constants_1.Constants.colors.error);
    }
    errorEmbed() {
        return this.baseErrorEmbed()
            .setTitle(this.error instanceof Error
            ? this.error.name
            : 'Error');
    }
    log(...text) {
        const id = `Incident ${this.incidentID} |`;
        Log_1.Log.error(id, ...text);
    }
}
exports.BaseErrorHandler = BaseErrorHandler;
