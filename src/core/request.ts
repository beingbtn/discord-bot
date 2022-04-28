import type { Client } from 'discord.js';
import { HTTPError } from '../errors/HTTPError';
import { Request } from '../utility/Request';

export class CoreRequest {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async request(url: string) {
        const response = await new Request(
            this.client.config,
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