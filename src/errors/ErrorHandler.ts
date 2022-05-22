import { BaseErrorHandler } from './BaseErrorHandler';

export class ErrorHandler<E> extends BaseErrorHandler<E> {
    data: string[];

    constructor(error: E, ...data: string[]) {
        super(error);
        this.data = data;
    }

    init() {
        this.log(this.error);

        if (this.data.length > 0) {
            this.log(...this.data);
        }

        this.sentry
            .captureException(this.error)
            .captureMessage(...this.data);
    }
}