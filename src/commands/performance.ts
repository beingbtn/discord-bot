import type { ClientCommand } from '../@types/client';
import { Constants } from '../utility/Constants';
import { BetterEmbed } from '../utility/utility';
import { RegionLocales } from '../locales/RegionLocales';

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
    const text = RegionLocales.locale(interaction.locale).commands.performance;
    const { replace } = RegionLocales;

    const {
        fetch: fetchPerformance,
        parse: parsePerformance,
        check: checkPerformance,
        send: sendPerformance,
        total,
    } = interaction.client.core.performance.latest!;

    const responseEmbed = new BetterEmbed(interaction)
        .setColor(Constants.colors.normal)
        .setTitle(text.title)
        .addFields({
            name: text.latest.name,
            value: replace(text.latest.value, {
                fetchPerformance: fetchPerformance,
                parsePerformance: parsePerformance,
                checkPerformance: checkPerformance,
                sendPerformance: sendPerformance,
                total: total,
            }),
        });

    await interaction.editReply({
        embeds: [responseEmbed],
    });
};