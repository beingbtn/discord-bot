import { container } from '@sapphire/framework';
import { HTTPError } from '../errors/HTTPError';
import { Request } from '../utility/Request';

export class CoreRequests {
    async request(url: string) {
        const response = await new Request(
            container.config,
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