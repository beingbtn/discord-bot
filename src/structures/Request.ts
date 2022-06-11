import { AbortError } from '../errors/AbortError';
import { AbortSignal } from 'node-fetch/externals';
import { i18n } from '../locales/i18n';
import { Log } from './Log';
import { setTimeout } from 'node:timers';
import { Options } from '../utility/Options';
import fetch, {
    type RequestInit,
    type Response,
} from 'node-fetch';

export class Request {
    readonly i18n: i18n;
    readonly restRequestTimeout: number;
    private retry: number;
    readonly retryLimit: number;

    public constructor(config?: {
        retryLimit?: number,
        restRequestTimeout?: number,
    }) {
        this.i18n = new i18n();

        this.restRequestTimeout = config?.restRequestTimeout ??
            Options.restRequestTimeout;

        this.retry = 0;

        this.retryLimit = config?.retryLimit ?? Options.retryLimit;
    }

    public async request(url: string, fetchOptions?: RequestInit): Promise<Response> {
        const controller = new AbortController();
        const abortTimeout = setTimeout(
            () => controller.abort(),
            this.restRequestTimeout,
        ).unref();

        try {
            const response = await fetch(url, {
                //Coerced due to a Typescript typings update to AbortController
                signal: controller.signal as AbortSignal,
                ...fetchOptions,
            });


            if (response.ok === true) {
                if (this.retry >= 1) {
                    Log.request(
                        this.i18n.getMessage(
                            'errorsRequestSuccessAfterRetry',
                        ),
                    );
                }

                return response;
            }

            if (
                this.retry < this.retryLimit &&
                response.status >= 500 &&
                response.status < 600
            ) {
                Log.request(
                    this.i18n.getMessage(
                        'errorsRequest500_600', [
                            response.status,
                        ],
                    ),
                );

                this.retry += 1;

                return this.request(url, fetchOptions);
            }

            return response;
        } catch (error) {
            if (this.retry < this.retryLimit) {
                Log.request(
                    this.i18n.getMessage(
                        'errorsRequestAbort',
                    ),
                );

                this.retry += 1;

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

    static async tryParse<Type>(
        response: Response,
    ): Promise<Type | null> {
        return response
            .json()
            .catch(() => null);
    }
}