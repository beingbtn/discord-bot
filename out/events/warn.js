"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const Log_1 = require("../utility/Log");
exports.properties = {
    name: 'warn',
    once: false,
};
const execute = (info) => {
    Log_1.Log.log('discord.js Warning', info);
};
exports.execute = execute;
