import type { CommandStatic } from '../@types/Command';
import {
    awaitComponent,
    disableComponents,
} from '../utility/utility';
import { BetterEmbed } from '../utility/BetterEmbed';
import { ChannelTypes } from 'discord.js/typings/enums';
import { constants } from '../utility/constants';
import {
    CommandInteraction,
    Constants as DiscordConstants,
    Formatters,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed,
    NewsChannel,
} from 'discord.js';
import { Log } from '../utility/Log';

export default class implements CommandStatic {
    static cooldown = 0;
    static ephemeral = true;
    static noDM = true;
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
        name: 'sendannouncements',
        description: 'Manually send announcements',
        options: [
            {
                name: 'channel',
                description: 'The channel to send the announcement to',
                type: 7,
                channel_types: [
                    ChannelTypes.GUILD_NEWS,
                    ChannelTypes.GUILD_TEXT,
                ],
                required: true,
            },
            {
                name: 'title',
                description: 'The title for the embed',
                type: 3,
                required: true,
            },
            {
                name: 'description',
                description: 'The description for the embed',
                type: 3,
                required: true,
            },
            {
                name: 'image',
                description: 'The image for the embed',
                type: 3,
                required: false,
            },
            {
                name: 'url',
                description: 'The url for the embed',
                type: 3,
                required: false,
            },
            {
                name: 'role',
                description: 'The role to mention with the announcement',
                type: 8,
                required: false,
            },
            {
                name: 'crosspost',
                description: 'Whether to crosspost the announcement (default to true)',
                type: 5,
                required: false,
            },
        ],
    };

    static async execute(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const channel = interaction.options.getChannel(
            'channel',
            true,
        ) as NewsChannel;

        const title = interaction.options.getString('title', true);
        const description = interaction.options.getString('description', true);
        const image = interaction.options.getString('image', false);
        const url = interaction.options.getString('url', false);

        const announcement = new MessageEmbed()
            .setAuthor({
                name: i18n.getMessage(
                    'commandsSendAnnouncementsEmbedAuthorName',
                ),
            })
            .setDescription(description)
            .setFooter({
                text: i18n.getMessage(
                    'commandsSendAnnouncementsEmbedFooterName',
                ),
                iconURL: 'https://cdn.discordapp.com/icons/489529070913060867/f7df056de15eabfc0a0e178d641f812b.webp?size=128',
            })
            .setTitle(title);

        if (image) {
            announcement.setImage(image);
        }

        if (url) {
            announcement.setURL(url);
        }

        const button = new MessageActionRow().setComponents(
            new MessageButton()
                .setCustomId('true')
                .setLabel(
                    i18n.getMessage(
                        'commandsSendAnnouncementsPreviewButtonLabel',
                    ),
                )
                .setStyle(DiscordConstants.MessageButtonStyles.PRIMARY),
        );

        const previewEmbed = new BetterEmbed(interaction)
            .setColor(constants.colors.normal)
            .setTitle(i18n.getMessage('commandsSendAnnouncementsPreviewTitle'))
            .setDescription(
                i18n.getMessage('commandsSendAnnouncementsPreviewDescription'),
            );

        const reply = await interaction.followUp({
            embeds: [previewEmbed, announcement],
            components: [button],
        });

        const componentFilter = (i: MessageComponentInteraction) =>
            interaction.user.id === i.user.id && i.message.id === reply.id;

        await interaction.client.channels.fetch(interaction.channelId);

        const disabledRows = disableComponents([button]);

        const previewButton = await awaitComponent(interaction.channel!, {
            componentType: 'BUTTON',
            filter: componentFilter,
            idle: constants.ms.second * 30,
        });

        if (previewButton === null) {
            await interaction.editReply({
                components: disabledRows,
            });

            return;
        }

        Log.interaction(
            interaction,
            i18n.getMessage('commandsSendAnnouncementsLogSending'),
        );

        const role = interaction.options.getRole('role', false);

        if (role) {
            await channel.send({
                content: Formatters.roleMention(role.id),
                allowedMentions: {
                    parse: ['roles'],
                },
            });
        }

        const sentAnnouncement = await channel.send({ embeds: [announcement] });

        if (
            sentAnnouncement.crosspostable &&
            interaction.options.getBoolean('crosspost', false) !== false
        ) {
            await sentAnnouncement.crosspost();
        }

        Log.interaction(
            interaction,
            i18n.getMessage('commandsSendAnnouncementsLogPublished'),
        );

        const successEmbed = new BetterEmbed(interaction)
            .setColor(constants.colors.normal)
            .setTitle(i18n.getMessage('commandsSendAnnouncementsSuccessTitle'))
            .setDescription(
                i18n.getMessage('commandsSendAnnouncementsSuccessDescription'),
            );

        await previewButton.update({
            embeds: [successEmbed],
            components: disabledRows,
        });
    }
}