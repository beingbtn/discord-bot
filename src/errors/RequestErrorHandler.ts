import { AbortError } from './AbortError';
import { BaseErrorHandler } from './BaseErrorHandler';
import { Core } from '../core/Core';
import { ErrorHandler } from './ErrorHandler';
import { HTTPError } from './HTTPError';
import { Severity } from '@sentry/node';

export class RequestErrorHandler<E> extends BaseErrorHandler<E> {
    readonly core: Core;

    constructor(error: E, core: Core) {
        super(error);
        this.core = core;

        const { errors: coreErrors } = this.core;

        if (this.error instanceof AbortError) {
            coreErrors.addAbort();
        } else if (this.error instanceof HTTPError) {
            coreErrors.addHTTP();
        } else {
            coreErrors.addGeneric();
        }
    }

    init() {
        try {
            if (this.error instanceof AbortError) {
                this.log(this.error.name);
            } else {
                this.log(this.error);
            }

            this.sentry
                .setSeverity(Severity.Warning)
                .requestContext(this.error, this.core)
                .captureException(this.error);
        } catch (error) {
            new ErrorHandler(error, this.incidentID).init();
        }
    }
}