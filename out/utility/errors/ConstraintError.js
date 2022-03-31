"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstraintError = void 0;
class ConstraintError extends Error {
    constructor(message, cooldown) {
        super(message);
        this.name = 'ConstraintError';
        this.cooldown = cooldown;
        //Thank you to https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
        Object.setPrototypeOf(this, ConstraintError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ConstraintError = ConstraintError;
