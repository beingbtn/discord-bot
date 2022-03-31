"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const Log_1 = require("../utility/Log");
exports.properties = {
    name: 'rateLimit',
    once: false,
};
const execute = (rateLimitInfo) => {
    Log_1.Log.error('Rate limit:', rateLimitInfo);
};
exports.execute = execute;
