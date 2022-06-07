import { BaseErrorHandler } from './BaseErrorHandler';
import { Severity } from '@sentry/node';

export class ErrorHandler<E> extends BaseErrorHandler<E> {
    data: string[];

    public constructor(error: E, ...data: string[]) {
        super(error);
        this.data = data;
    }

    public init(severity?: Severity) {
        this.log(this.error);

        if (this.data.length !== 0) {
            this.log(...this.data);
        }

        this.sentry
            .setSeverity(severity ?? Severity.Error)
            .captureException(this.error)
            .captureMessages(...this.data);
    }
}