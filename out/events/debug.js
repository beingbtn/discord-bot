"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const Log_1 = require("../utility/Log");
exports.properties = {
    name: 'debug',
    once: false,
};
const execute = (info) => {
    return;
    Log_1.Log.log(info);
};
exports.execute = execute;
