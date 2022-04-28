export class ConstraintError extends Error {
    readonly cooldown?: number;

    constructor(
        message:
            | 'devMode'
            | 'owner'
            | 'dm'
            | 'cooldown',
        cooldown?: number,
    ) {
        super(message);
        this.name = 'ConstraintError';
        this.cooldown = cooldown;

        Object.setPrototypeOf(this, ConstraintError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}