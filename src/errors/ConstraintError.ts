export class ConstraintError extends Error {
    public constructor(
        message:
        | 'devMode'
        | 'owner'
        | 'dm'
        | 'userPermissions'
        | 'botPermissions'
        | 'cooldown',
    ) {
        super(message);
        this.name = 'ConstraintError';

        Object.setPrototypeOf(this, ConstraintError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}