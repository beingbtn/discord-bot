"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const ErrorHandler_1 = require("../utility/errors/ErrorHandler");
const Log_1 = require("../utility/Log");
const utility_1 = require("../utility/utility");
exports.properties = {
    name: 'guildCreate',
    once: false,
};
const execute = async (guild) => {
    if (guild.available === false ||
        !guild.client.isReady()) {
        return;
    }
    Log_1.Log.log(`Bot has joined a guild. Guild: ${guild.name} | ${guild.id} Guild Owner: ${guild.ownerId} Guild Member Count: ${guild.memberCount} (w/ bot)`);
    try {
        (0, utility_1.setPresence)(guild.client);
    }
    catch (error) {
        await ErrorHandler_1.ErrorHandler.init(error);
    }
};
exports.execute = execute;
