import type { ClientCommand } from '../@types/client';
import { BetterEmbed } from '../utility/BetterEmbed';
import {
    cleanLength,
    cleanRound,
} from '../utility/utility';
import { constants } from '../utility/constants';
import process from 'node:process';

export const properties: ClientCommand['properties'] = {
    name: 'system',
    description: 'View system information.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    permissions: {
        bot: {
            global: [],
            local: [],
        },
        user: {
            global: [],
            local: [],
        },
    },
    structure: {
        name: 'system',
        description: 'View system information',
    },
};

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const { i18n } = interaction;

    const memoryMegaBytes = process.memoryUsage.rss() / (2 ** 20);

    const responseEmbed = new BetterEmbed(interaction)
        .setColor(constants.colors.normal)
        .setTitle(i18n.getMessage('commandsSystemTitle'))
        .addFields(
            {
                name: i18n.getMessage('commandsSystemUptimeName'),
                value: cleanLength(process.uptime() * 1000)!,
            },
            {
                name: i18n.getMessage('commandsSystemMemoryName'),
                value: i18n.getMessage('commandsSystemMemberValue', [
                    cleanRound(memoryMegaBytes, 1),
                ]),
            },
            {
                name: i18n.getMessage('commandsSystemServersName'),
                value: String(interaction.client.guilds.cache.size),
            },
            {
                name: i18n.getMessage('commandsSystemUsersName'),
                value: String(
                    interaction.client.guilds.cache.reduce(
                        (acc, guild) => acc + guild.memberCount,
                        0,
                    ),
                ),
            },
        );

    await interaction.editReply({
        embeds: [responseEmbed],
    });
};