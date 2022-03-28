import type { rssJSON } from './format';
import {
    Client,
    MessageEmbed,
    NewsChannel,
} from 'discord.js';

export class CoreDispatch {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async dispatch(data: rssJSON) {
        const posts: MessageEmbed[] = [];

        for (const item of data.items) {
            const embed = new MessageEmbed()
                .setAuthor({
                    name: `Announcement by ${item.author}`,
                })
                .setDescription(item.content)
                .setFooter({
                    text: 'Hypixel - Minecraft Server and Maps',
                    iconURL: 'https://cdn.discordapp.com/icons/489529070913060867/f7df056de15eabfc0a0e178d641f812b.webp?size=128',
                })
                .setTitle(item.title)
                .setURL(item.link);

            const mainImage = item.attachments[0];

            if (typeof mainImage !== 'undefined') {
                embed.setImage(mainImage);
            }

            posts.unshift(embed);
        }

        const channels = JSON.parse(process.env.channels!);

        const channel = await this.client.channels.fetch(
            channels[data.title],
        ) as NewsChannel;

        const splitPostEmbeds = [];

        for (let index = 0; index < posts.length; index += 5) {
            const subArray = posts.slice(index, index + 5);
            splitPostEmbeds.push(subArray);
        }

        for (const splitPost of splitPostEmbeds) {
            const unpublished = await (channel).send({ embeds: splitPost }); //eslint-disable-line no-await-in-loop
            await unpublished.crosspost(); //eslint-disable-line no-await-in-loop
        }
    }
}