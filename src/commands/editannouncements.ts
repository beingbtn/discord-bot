import type { ClientCommand } from '../@types/client';
import {
    awaitComponent,
    BetterEmbed,
    disableComponents,
} from '../utility/utility';
import { Constants } from '../utility/Constants';
import {
    Constants as DiscordConstants,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed,
} from 'discord.js';
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
                name: 'description',
                description: 'The new description for the embed',
                type: 3,
                required: false,
            },
            {
                name: 'image',
                description: 'The new image for the embed',
                type: 3,
                required: false,
            },
        ],
    },
};

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const { i18n } = interaction;

    const messageID = interaction.options.getString('message', true);
    const description = interaction.options.getString('description', false);
    const image = interaction.options.getString('image', false);

    const message = await interaction.channel!.messages.fetch(messageID);

    const tempEmbed = new MessageEmbed(message.embeds[0]);

    if (image) {
        tempEmbed.setImage(image);
    }

    if (description) {
        tempEmbed.setDescription(description);
    }

    message.embeds[0] = tempEmbed;

    const button = new MessageActionRow().setComponents(
        new MessageButton()
            .setCustomId('true')
            .setLabel(
                i18n.getMessage(
                    'commandsEditAnnouncementsPreviewButtonLabel',
                ),
            )
            .setStyle(DiscordConstants.MessageButtonStyles.PRIMARY),
    );

    const previewEmbed = new BetterEmbed(interaction)
        .setColor(Constants.colors.normal)
        .setTitle(i18n.getMessage('commandsEditAnnouncementsPreviewTitle'))
        .setDescription(
            i18n.getMessage('commandsEditAnnouncementsPreviewDescription'),
        );

    const reply = await interaction.followUp({
        embeds: [previewEmbed, ...message.embeds],
        components: [button],
    });

    const componentFilter = (i: MessageComponentInteraction) =>
        interaction.user.id === i.user.id && i.message.id === reply.id;

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

    Log.interaction(
        interaction,
        i18n.getMessage('commandsEditAnnouncementsLogEditing'),
    );

    await message.edit({ embeds: message.embeds });

    Log.interaction(
        interaction,
        i18n.getMessage('commandsEditAnnouncementsLogPublished'),
    );

    const successEmbed = new BetterEmbed(interaction)
        .setColor(Constants.colors.normal)
        .setTitle(i18n.getMessage('commandsEditAnnouncementsSuccessTitle'))
        .setDescription(
            i18n.getMessage('commandsEditAnnouncementsSuccessDescription'),
        );

    await previewButton.update({
        embeds: [successEmbed],
        components: disabledRows,
    });
};