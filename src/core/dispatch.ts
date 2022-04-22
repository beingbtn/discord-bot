import type { rssJSON } from './format';
import {
    Client,
    MessageActionRow,
    MessageEmbed,
    NewsChannel,
} from 'discord.js';
import process from 'node:process';

export class CoreDispatch {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async dispatch(
        embeds: MessageEmbed[],
        components: MessageActionRow[],
        data: rssJSON,
    ) {
        const channels = JSON.parse(process.env.ANNOUNCEMENTS!);

        const channel = await this.client.channels.fetch(
            channels[data.title].id,
        ) as NewsChannel;

        for (let index = 0; index < embeds.length; index += 1) {
            const embed = embeds[index];
            const actionRow = components[index];

            // eslint-disable-next-line no-await-in-loop
            const unpublished = await (channel).send({
                embeds: [embed],
                components: [actionRow],
            });

            await unpublished.crosspost(); //eslint-disable-line no-await-in-loop
        }
    }
}