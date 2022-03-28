import {
    Client,
    MessageEmbed,
    NewsChannel,
} from 'discord.js';
import type { rssJSON } from './format';
import { Constants } from '../utility/Constants';

export class CoreDispatch {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async dispatch(data: rssJSON) {
        const posts: MessageEmbed[] = [];

        for (const item of data.items) {
            const embed = new MessageEmbed()
                .setAuthor({ name: `Author: ${item.author}` })
                .setColor(Constants.colors.hypixel)
                .setDescription(item.content)
                .setTitle(item.title)
                .setURL(item.link);

            const mainImage = item.attachments[0];

            if (typeof mainImage !== 'undefined') {
                embed.setImage(mainImage);
            }

            posts.push(embed);
        }

        const channels = JSON.parse(process.env.channels!);

        const channel = await this.client.channels.fetch(
            channels[data.title],
        ) as NewsChannel;

        const splitPostEmbeds = [];

        for (let index = 0; index < posts.length; index += 10) {
            const subArray = posts.slice(index, index + 10);
            splitPostEmbeds.push(subArray);
        }

        for (const splitPost of splitPostEmbeds) {
            const unpublished = await (channel).send({ embeds: splitPost }); //eslint-disable-line no-await-in-loop
            await unpublished.crosspost(); //eslint-disable-line no-await-in-loop
        }
    }
}