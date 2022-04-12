import type { ClientCommand } from '../@types/client';
import { awaitComponent, BetterEmbed } from '../utility/utility';
import { Constants } from '../utility/Constants';
import { Log } from '../utility/Log';
import { RegionLocales } from '../locales/RegionLocales';

export const properties: ClientCommand['properties'] = {
    name: 'deploy',
    description: 'Deploy commands.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'editannouncement',
        description: 'Edit an announcement',
        options: [
            {
                name: 'message',
                description: 'Message ID',
                type: 3,
                required: true,
            },
        ],
    },
};

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const text = RegionLocales.locale(interaction.locale).commands.deploy;
    const messageID = interaction.options.getString('message', true);

    try {
        const message = await interaction.channel!.messages.fetch(messageID);

        const content = '';

        message.embeds[0]!.description = content;

        await interaction.followUp({ embeds: [message.embeds[0]] });

        await awaitComponent(interaction.channel!, 'BUTTON', {
            time: 30_000,
        });
    } catch (error) {
        const errorEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.warning)
            .setTitle('placeholder')
            .setDescription(JSON.stringify(error));

        await interaction.editReply({ embeds: [errorEmbed] });
    }
};