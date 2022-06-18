import { MessageEmbed } from 'discord.js';
import { Base } from '../structures/Base';
import { type RssJSON } from './Format';

export class Embeds extends Base {
    public create(data: RssJSON) {
        const posts: MessageEmbed[] = [];

        data.items.forEach((item) => {
            const embed = new MessageEmbed()
                .setAuthor({
                    name: item.author,
                })
                .setDescription(item.content)
                .setFooter({
                    text: data.title,
                    iconURL: 'https://cdn.discordapp.com/icons/489529070913060867/f7df056de15eabfc0a0e178d641f812b.webp?size=128',
                })
                .setTitle(item.title)
                .setURL(item.link);

            const mainImage = item.attachments[0];

            if (typeof mainImage !== 'undefined') {
                embed.setImage(mainImage);
            }

            posts.unshift(embed);
        });

        return posts;
    }
}