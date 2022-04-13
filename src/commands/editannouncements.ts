import type { ClientCommand } from '../@types/client';
import { awaitComponent, BetterEmbed } from '../utility/utility';
import { Constants } from '../utility/Constants';
import {
    Constants as DiscordConstants,
    MessageActionRow,
    MessageButton,
} from 'discord.js';
import { RegionLocales } from '../locales/RegionLocales';

export const properties: ClientCommand['properties'] = {
    name: 'editannouncements',
    description: 'Edit announcements.',
    cooldown: 0,
    ephemeral: true,
    noDM: true,
    ownerOnly: true,
    structure: {
        name: 'editannouncements',
        description: 'Edit announcements',
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
    const text = RegionLocales.locale(
        interaction.locale,
    ).commands.editannouncements;

    const messageID = interaction.options.getString('message', true);

    try {
        const message = await interaction.channel!.messages.fetch(messageID);

        const content = 'testing 123 testing 321';

        message.embeds[0]!.description = content;

        const button = new MessageActionRow()
            .setComponents(
                new MessageButton()
                    .setCustomId('true')
                    .setLabel(text.preview.buttonLabel)
                    .setStyle(DiscordConstants.MessageButtonStyles.PRIMARY),
            );

        const previewEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(text.preview.title)
            .setDescription(text.preview.description);

        await interaction.followUp({
            embeds: [
                previewEmbed,
                ...message.embeds,
            ],
            components: [button],
        });

        await awaitComponent(interaction.channel!, 'BUTTON', {
            time: 30_000,
        });

        await message.edit({ embeds: message.embeds });
    } catch (error) {
        const errorEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.warning)
            .setTitle('placeholder')
            .setDescription(JSON.stringify(error));

        await interaction.editReply({ embeds: [errorEmbed] });
    }
};