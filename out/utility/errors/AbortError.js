"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbortError = void 0;
const HTTPError_1 = require("./HTTPError");
class AbortError extends HTTPError_1.HTTPError {
    constructor({ message, url, }) {
        super({
            message: message,
            url: url,
        });
        this.name = 'AbortError';
        Object.setPrototypeOf(this, AbortError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AbortError = AbortError;
