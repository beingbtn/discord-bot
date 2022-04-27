import type { ClientCommand } from '../@types/client';
import { Constants } from '../utility/Constants';
import { BetterEmbed } from '../utility/utility';

export const properties: ClientCommand['properties'] = {
    name: 'performance',
    description: 'View system performance.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'performance',
        description: 'View system performance',
    },
};

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const { i18n } = interaction;

    const {
        fetch: fetchPerformance,
        parse: parsePerformance,
        check: checkPerformance,
        send: sendPerformance,
        total,
    } = interaction.client.core.performance.latest!;

    const responseEmbed = new BetterEmbed(interaction)
        .setColor(Constants.colors.normal)
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
};