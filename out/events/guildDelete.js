"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const ErrorHandler_1 = require("../utility/errors/ErrorHandler");
const utility_1 = require("../utility/utility");
const Log_1 = require("../utility/Log");
exports.properties = {
    name: 'guildDelete',
    once: false,
};
const execute = async (guild) => {
    if (guild.available === false ||
        !guild.client.isReady()) {
        return;
    }
    const joinedAt = (0, utility_1.formattedUnix)({
        ms: guild.joinedTimestamp,
        date: true,
        utc: true,
    });
    Log_1.Log.log(`Bot has left a guild; joined ${joinedAt}. Guild: ${guild.name} | ${guild.id} Guild Owner: ${guild.ownerId} Guild Member Count: ${guild.memberCount - 1} (new count)`);
    try {
        (0, utility_1.setPresence)(guild.client);
    }
    catch (error) {
        await ErrorHandler_1.ErrorHandler.init(error);
    }
};
exports.execute = execute;
