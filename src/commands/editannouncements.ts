import type { ClientCommand } from '../@types/client';
import { awaitComponent, BetterEmbed, disableComponents } from '../utility/utility';
import { Constants } from '../utility/Constants';
import {
    Constants as DiscordConstants,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
} from 'discord.js';
import { RegionLocales } from '../locales/RegionLocales';
import { Log } from '../utility/Log';

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
            {
                name: 'index',
                description: 'The index of the embed to modify',
                type: 4,
                required: true,
            },
            {
                name: 'description',
                description: 'The new description for the embed',
                type: 3,
                required: false,
            },
            {
                name: 'image',
                description: 'The new image states for the embed',
                type: 3,
                required: false,
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
    const index = interaction.options.getNumber('index', true);
    const description = interaction.options.getString('description', false);
    const image = interaction.options.getString('image', false);

    const message = await interaction.channel!.messages.fetch(messageID);

    if (image) {
        message.embeds[index].setImage(image);
    }

    if (description) {
        message.embeds[index].setDescription(description);
    }

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

    const reply = await interaction.followUp({
        embeds: [
            previewEmbed,
            message.embeds[index],
        ],
        components: [button],
    });

    const componentFilter = (i: MessageComponentInteraction) =>
        interaction.user.id === i.user.id &&
        i.message.id === reply.id;

    await interaction.client.channels.fetch(interaction.channelId);

    const disabledRows = disableComponents([button]);

    const previewButton = await awaitComponent(interaction.channel!, 'BUTTON', {
        filter: componentFilter,
        idle: Constants.ms.second * 30,
    });

    if (previewButton === null) {
        await interaction.editReply({
            components: disabledRows,
        });

        return;
    }

    Log.interaction(interaction, 'Editing message...');

    await message.edit({ embeds: message.embeds });

    Log.interaction(interaction, 'Published message!');

    const successEmbed = new BetterEmbed(interaction)
        .setColor(Constants.colors.normal)
        .setTitle(text.success.title)
        .setDescription(text.success.description);

    await previewButton.update({
        embeds: [successEmbed],
        components: disabledRows,
    });
};