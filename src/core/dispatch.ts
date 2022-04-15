import type { rssJSON } from './format';
import {
    Client,
    MessageEmbed,
    NewsChannel,
} from 'discord.js';
import process from 'node:process';

export class CoreDispatch {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async dispatch(embeds: MessageEmbed[], data: rssJSON) {
        const channels = JSON.parse(process.env.ANNOUNCEMENTS!);

        const channel = await this.client.channels.fetch(
            channels[data.title].id,
        ) as NewsChannel;

        const splitPostEmbeds = [];

        for (let index = 0; index < embeds.length; index += 5) {
            const subArray = embeds.slice(index, index + 5);
            splitPostEmbeds.push(subArray);
        }

        for (const splitPost of splitPostEmbeds) {
            const unpublished = await (channel).send({ embeds: splitPost }); //eslint-disable-line no-await-in-loop
            await unpublished.crosspost(); //eslint-disable-line no-await-in-loop
        }
    }
}