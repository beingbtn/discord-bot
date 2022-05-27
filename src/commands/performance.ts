import type { CommandInteraction } from 'discord.js';
import type { CommandStatic } from '../@types/Command';
import { constants } from '../utility/constants';
import { BetterEmbed } from '../utility/BetterEmbed';

export default class implements CommandStatic {
    static cooldown = 0;
    static ephemeral = true;
    static noDM = false;
    static ownerOnly = true;
    static permissions = {
        bot: {
            global: [],
            local: [],
        },
        user: {
            global: [],
            local: [],
        },
    };
    static structure = {
        name: 'performance',
        description: 'View system performance',
    };

    static async execute(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const {
            fetch: fetchPerformance,
            parse: parsePerformance,
            check: checkPerformance,
            send: sendPerformance,
            total,
        } = interaction.client.core.performance.latest!;

        const responseEmbed = new BetterEmbed(interaction)
            .setColor(constants.colors.normal)
            .setTitle(i18n.getMessage('commandsPerformanceTitle'))
            .addFields({
                name: i18n.getMessage('commandsPerformanceLatestName'),
                value: i18n.getMessage('commandsPerformanceLatestValue', [
                    fetchPerformance,
                    parsePerformance,
                    checkPerformance,
                    sendPerformance,
                    total,
                ]),
            });

        await interaction.editReply({
            embeds: [responseEmbed],
        });
    }
}