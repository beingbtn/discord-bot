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
                description: 'The message to target',
                type: 3,
                required: true,
            },
            {
                name: 'title',
                description: 'The new title for the embed',
                type: 3,
                required: false,
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
            {
                name: 'url',
                description: 'The new url for the embed',
                type: 3,
                required: false,
            },
            {
                name: 'crosspost',
                description: 'Whether to crosspost the announcement, if not already (default to true)',
                type: 5,
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
    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', false);
    const image = interaction.options.getString('image', false);
    const url = interaction.options.getString('url', false);

    const message = await interaction.channel!.messages.fetch(messageID);

    const tempEmbed = new MessageEmbed(message.embeds[0]);

    if (title) {
        tempEmbed.setTitle(title);
    }

    if (description) {
        tempEmbed.setDescription(description);
    }

    if (image) {
        tempEmbed.setImage(image);
    }

    if (url) {
        tempEmbed.setURL(url);
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

    const editedAnnouncement = await message.edit({ embeds: message.embeds });

    //Case for when a channel is converted to an announcement channel
    if (
        editedAnnouncement.crosspostable &&
        interaction.options.getBoolean('crosspost', false) !== false
    ) {
        await editedAnnouncement.crosspost();
    }

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