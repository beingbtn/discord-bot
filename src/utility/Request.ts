import { AbortError } from '../errors/AbortError';
import { Constants } from './Constants';
import fetch, {
    RequestInit,
    Response,
} from 'node-fetch';
import { Log } from './Log';
import { setTimeout } from 'node:timers';
import { i18n } from '../locales/i18n';

export class Request {
    readonly i18n: i18n;
    readonly restRequestTimeout: number;
    private try: number;
    readonly tryLimit: number;

    constructor(config?: {
        retryLimit?: number,
        restRequestTimeout?: number,
    }) {
        this.i18n = new i18n();

        this.restRequestTimeout = config?.restRequestTimeout ??
            Constants.defaults.request.restRequestTimeout;

        this.try = 0;

        this.tryLimit = (config?.retryLimit ?? 2) + 1;
    }

    async request(url: string, fetchOptions?: RequestInit): Promise<Response> {
        this.try += 1;

        const controller = new AbortController();
        const abortTimeout = setTimeout(
            () => controller.abort(),
            this.restRequestTimeout,
        ).unref();

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                ...fetchOptions,
            });


            if (response.ok === true) {
                if (this.try > 1) {
                    Log.request(
                        this.i18n.getMessage('errorsRequestSuccessAfterRetry'),
                    );
                }

                return response;
            }

            if (
                this.try < this.tryLimit &&
                response.status >= 500 &&
                response.status < 600
            ) {
                Log.request(this.i18n.getMessage('errorsRequest500_600', [
                    response.status,
                ]));

                return this.request(url, fetchOptions);
            }

            return response;
        } catch (error) {
            if (this.try < this.tryLimit) {
                Log.request(this.i18n.getMessage('errorsRequestAbort'));
                return this.request(url, fetchOptions);
            }

            throw new AbortError({
                message: (error as Error)?.message,
                url: url,
            });
        } finally {
            clearTimeout(abortTimeout);
        }
    }

    static tryParse<Type>(
        response: Response,
    ): Promise<Type | null> {
        return response
            .json()
            .catch(() => null);
    }
}