import type { rssJSON } from './CoreFormat';
import { container } from '@sapphire/framework';
import { Database } from '../utility/Database';
import {
    Formatters,
    MessageActionRow,
    MessageEmbed,
    NewsChannel,
} from 'discord.js';
import { Options } from '../utility/Options';
import { setTimeout } from 'node:timers/promises';
import process from 'node:process';

/* eslint-disable no-await-in-loop */

export class CoreDispatch {
    announcements: {
        [key: string]: {
            id: string
            maxComments: number,
            role: string,
        }
    };

    constructor() {
        this.announcements = JSON.parse(process.env.ANNOUNCEMENTS!);
    }

    static async postsGet(data: rssJSON, editedThreadIDs: string[]): Promise<{
        id: string,
        message: string,
    }[]> {
        const posts = await Database.query(
            `SELECT id, message FROM "${data.title}" WHERE id IN (${
                editedThreadIDs.join(', ')
            })`,
        );

        return posts.rows;
    }

    static async postSet(data: rssJSON, id: string, messageID: string) {
        await Database.query(
            `UPDATE "${data.title}" SET message = $1 WHERE id = $2`,
            [messageID, id],
        );
    }

    async dispatch(
        embeds: MessageEmbed[],
        components: MessageActionRow[],
        data: rssJSON,
    ) {
        const announcement = this.announcements[data.title];
        const channel = await container.client.channels.fetch(
            announcement.id,
        ) as NewsChannel;

        const editedThreadIDs = data.items.filter(
            item => item.edited === true,
        ).map(
            item => `'${item.id}'`,
        );

        const editedPosts = editedThreadIDs.length > 0
            ? await CoreDispatch.postsGet(data, editedThreadIDs)
            : [];

        if (data.items.some(item => item.edited === false)) {
            await channel.send({
                content: Formatters.roleMention(announcement.role),
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
                post => post.id === item.id,
            );

            const payload = {
                embeds: [embed],
                components: [actionRow],
            };

            if (item.edited === false) {
                const message = await channel.send(payload);

                if (message.crosspostable) {
                    await message.crosspost();
                }

                await CoreDispatch.postSet(data, item.id, message.id);
            } else {
                const message = await channel.messages.fetch(
                    editedPost!.message,
                );

                await message.edit(payload);
            }

            await setTimeout(Options.coreDispatchTimeout);
        }
    }
}