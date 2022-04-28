import type { Locale } from '../@types/locales';

export class ConstraintError extends Error {
    readonly cooldown?: number;

    constructor(message: keyof Locale['errors']['constraintErrors'], cooldown?: number) {
        super(message);
        this.name = 'ConstraintError';
        this.cooldown = cooldown;

        Object.setPrototypeOf(this, ConstraintError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}