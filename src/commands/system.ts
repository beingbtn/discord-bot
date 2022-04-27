import type { ClientCommand } from '../@types/client';
import {
    BetterEmbed,
    cleanLength,
    cleanRound,
} from '../utility/utility';
import { Constants } from '../utility/Constants';
import process from 'node:process';

export const properties: ClientCommand['properties'] = {
    name: 'system',
    description: 'View system information.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
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
        .setColor(Constants.colors.normal)
        .setTitle(i18n.getMessage('commandsSystemTitle'))
        .addFields(
            {
                name: i18n.getMessage('commandsSystemUptimeName'),
                value: String(cleanLength(process.uptime() * 1000)),
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