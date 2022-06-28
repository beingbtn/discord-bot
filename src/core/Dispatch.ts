import { setTimeout } from 'node:timers/promises';
import {
    Formatters,
    type MessageActionRow,
    type MessageEmbed,
    type NewsChannel,
} from 'discord.js';
import { type RSS } from '../@types/RSS';
import { Base } from '../structures/Base';
import { Options } from '../utility/Options';

/* eslint-disable no-await-in-loop */

export class Dispatch extends Base {
    public async dispatch(
        embeds: MessageEmbed[],
        components: MessageActionRow[],
        data: RSS,
    ) {
        const { channelID, roleID } = this.container.announcements.find(
            (announcement) => announcement.category === data.title,
        )!;

        const channel = await this.container.client.channels.fetch(
            channelID,
        ) as NewsChannel;

        const editedThreadIDs = data.items.filter(
            (item) => item.edited === true,
        ).map(
            (item) => `'${item.id}'`,
        );

        const editedPosts = editedThreadIDs.length > 0
            ? await this.postsGet(data, editedThreadIDs)
            : [];

        if (data.items.some((item) => item.edited === false)) {
            await channel.send({
                content: Formatters.roleMention(roleID),
                allowedMentions: {
                    parse: ['roles'],
                },
            });
        }

        for (let index = 0; index < embeds.length; index += 1) {
            const item = data.items[index];
            const embed = embeds[index];
            const actionRow = components[index];

            const editedPost = editedPosts.find(
                (post) => post.id === item.id,
            );

            const payload = {
                embeds: [embed],
                components: [actionRow],
            };

            if (item.edited === false) {
                const message = await channel.send(payload);

                if (message.crosspostable === true) {
                    await message.crosspost();
                }

                await this.postSet(data, item.id, message.id);
            } else {
                const message = await channel.messages.fetch(
                    editedPost!.message,
                );

                await message.edit(payload);
            }

            await setTimeout(Options.coreDispatchTimeout);
        }
    }

    private async postsGet(data: RSS, editedThreadIDs: string[]) {
        const posts = await this.container.database.query(
            `SELECT id, message FROM "${
                data.title
            }" WHERE id IN (${
                editedThreadIDs.join(', ')
            })`,
        );

        return posts.rows as {
            id: string,
            message: string,
        }[];
    }

    private async postSet(data: RSS, id: string, messageID: string) {
        await this.container.database.query(
            `UPDATE "${
                data.title
            }" SET message = $1 WHERE id = $2`,
            [messageID, id],
        );
    }
}