import { AbortError } from './AbortError';
import { BaseErrorHandler } from './BaseErrorHandler';
import { ErrorHandler } from './ErrorHandler';

export class HTTPErrorHandler<E> extends BaseErrorHandler<E> {
    public constructor(error: E) {
        super(error);
    }

    public init() {
        try {
            if (this.error instanceof AbortError) {
                this.log(this.error.name);
            } else {
                this.log(this.error);
            }

            this.sentry
                .setSeverity('warning')
                .httpContext(this.error)
                .captureException(this.error);
        } catch (error) {
            new ErrorHandler(error, this.incidentId).init();
        }
    }
}