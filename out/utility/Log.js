"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const utility_1 = require("./utility");
class Log {
    static base(type) {
        const time = (0, utility_1.formattedUnix)({ date: true, utc: true });
        return `${time} [${type}]`;
    }
    static error(...text) {
        console.error(this.base('ERROR'), ...text);
    }
    static interaction(interaction, ...text) {
        console.log(this.base('INTERACTION'), interaction.id, interaction.user.id, ...text);
    }
    static log(...text) {
        console.log(this.base('LOG'), ...text);
    }
    static request(...text) {
        console.log(this.base('REQUEST'), ...text);
    }
}
exports.Log = Log;
