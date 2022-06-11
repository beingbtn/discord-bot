import { BaseCore } from './BaseCore';
import { HTTPError } from '../errors/HTTPError';
import { Request } from '../structures/Request';

export class Requests extends BaseCore {
    public async request(url: string) {
        const response = await new Request(
            this.container.config,
        ).request(url);

        if (response.ok === false) {
            throw new HTTPError({
                response: response,
                url: url,
            });
        }

        const xml = await response.text();

        return xml;
    }
}