"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const Log_1 = require("../utility/Log");
exports.properties = {
    name: 'error',
    once: false,
};
const execute = (error) => {
    Log_1.Log.error(`discord.js Error`, error);
};
exports.execute = execute;
