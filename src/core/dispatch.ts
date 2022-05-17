import type { rssJSON } from './format';
import {
    Client,
    Formatters,
    MessageActionRow,
    MessageEmbed,
    NewsChannel,
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';
import process from 'node:process';

export class CoreDispatch {
    announcements: {
        [key: string]: {
            id: string
            maxComments: number,
            role: string,
        }
    };
    client: Client;

    constructor(client: Client) {
        this.announcements = JSON.parse(process.env.ANNOUNCEMENTS!);
        this.client = client;
    }

    async dispatch(
        embeds: MessageEmbed[],
        components: MessageActionRow[],
        data: rssJSON,
    ) {
        const announcement = this.announcements[data.title];
        const channel = await this.client.channels.fetch(
            announcement.id,
        ) as NewsChannel;

        await channel.send({
            content: Formatters.roleMention(announcement.role),
            allowedMentions: {
                parse: ['roles'],
            },
        });

        for (let index = 0; index < embeds.length; index += 1) {
            const embed = embeds[index];
            const actionRow = components[index];

            // eslint-disable-next-line no-await-in-loop
            const unpublished = await channel.send({
                embeds: [embed],
                components: [actionRow],
            });

            if (unpublished.crosspostable) {
                // eslint-disable-next-line no-await-in-loop
                await unpublished.crosspost();
            }

            // eslint-disable-next-line no-await-in-loop
            await setTimeout(2500);
        }
    }
}