"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const Constants_1 = require("../utility/Constants");
const ErrorHandler_1 = require("../utility/errors/ErrorHandler");
const Log_1 = require("../utility/Log");
const utility_1 = require("../utility/utility");
exports.properties = {
    name: 'ready',
    once: true,
};
const execute = async (client) => {
    Log_1.Log.log(`Logged in as ${client?.user?.tag}!`);
    await set();
    setInterval(set, Constants_1.Constants.ms.hour);
    async function set() {
        try {
            (0, utility_1.setPresence)(client);
        }
        catch (error) {
            await ErrorHandler_1.ErrorHandler.init(error);
        }
    }
    await client.core.init();
};
exports.execute = execute;
