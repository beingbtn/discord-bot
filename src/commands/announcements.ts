import type { ClientCommand } from '../@types/client';
import { BetterEmbed } from '../utility/utility';
import { ChannelTypes } from 'discord.js/typings/enums';
import { Constants } from '../utility/Constants';
import {
    Formatters,
    NewsChannel,
    Permissions,
    TextChannel,
} from 'discord.js';
import { Log } from '../utility/Log';
import { RegionLocales } from '../locales/RegionLocales';

export const properties: ClientCommand['properties'] = {
    name: 'announcements',
    description: 'Configure what announcements you want to receive.',
    cooldown: 10_000,
    ephemeral: true,
    noDM: true,
    ownerOnly: false,
    structure: {
        name: 'announcements',
        description: 'Configure what announcements you want to receive',
        options: [
            {
                name: 'general',
                description: 'General Hypixel News and Announcements',
                type: 2,
                options: [
                    {
                        name: 'add',
                        description: 'Add this type of announcement to a selected channel',
                        type: 1,
                        options: [
                            {
                                name: 'channel',
                                type: 7,
                                channel_types: [ChannelTypes.GUILD_TEXT],
                                description: 'Choose the channel to send these announcements to',
                                required: true,
                            },
                        ],
                    },
                    {
                        name: 'remove',
                        description: 'Stop receiving these announcements',
                        type: 1,
                        options: [
                            {
                                name: 'channel',
                                type: 7,
                                channel_types: [ChannelTypes.GUILD_TEXT],
                                description: 'Choose the channel you want announcements to stop being sent to',
                                required: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'skyblock',
                description: 'SkyBlock Patch Notes',
                type: 2,
                options: [
                    {
                        name: 'add',
                        description: 'Add this type of announcement to a selected channel',
                        type: 1,
                        options: [
                            {
                                name: 'channel',
                                type: 7,
                                channel_types: [ChannelTypes.GUILD_TEXT],
                                description: 'Choose the channel to send these announcements to',
                                required: true,
                            },
                        ],
                    },
                    {
                        name: 'remove',
                        description: 'Stop receiving these announcements',
                        type: 1,
                        options: [
                            {
                                name: 'channel',
                                type: 7,
                                channel_types: [ChannelTypes.GUILD_TEXT],
                                description: 'Choose the channel you want announcements to stop being sent to',
                                required: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
};

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const text = RegionLocales.locale(
        interaction.locale,
    ).commands.announcements;
    const { replace } = RegionLocales;

    const channel = interaction.options.getChannel('channel', true) as TextChannel;

    const userHasPermission = channel
        .permissionsFor(interaction.member)
        .has([
            Permissions.FLAGS.MANAGE_WEBHOOKS,
        ]);

    if (userHasPermission === false) {
        const missingPermission = new BetterEmbed(interaction)
            .setColor(Constants.colors.warning)
            .setTitle(text.userMissingPermission.title)
            .setDescription(text.userMissingPermission.description);

        Log.interaction(interaction, 'User missing permission');

        await interaction.editReply({ embeds: [missingPermission] });

        return;
    }

    const botHasPermission = channel
        .permissionsFor(interaction.guild.me!)
        .missing([
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.MANAGE_WEBHOOKS,
        ]);

    if (botHasPermission.length > 0) {
        const missingPermission = new BetterEmbed(interaction)
            .setColor(Constants.colors.warning)
            .setTitle(text.botMissingPermission.title)
            .setDescription(replace(text.botMissingPermission.description, {
                permissions: botHasPermission,
            }));

        Log.interaction(interaction, 'Bot missing permission(s)');

        await interaction.editReply({ embeds: [missingPermission] });

        return;
    }

    const type = interaction.options.getSubcommandGroup() === 'general'
        ? 'News and Announcements'
        : 'SkyBlock Patch Notes';

    const channels = JSON.parse(process.env.announcements!);
    const announcementID = channels[type].id as string;

    switch (interaction.options.getSubcommand()) {
        case 'add': await addAnnouncement();
            break;
        case 'remove': await removeAnnouncement();
            break;
        //No default
    }

    async function addAnnouncement() {
        const oldWebhooks = await channel.fetchWebhooks();
        const existingAnnouncements = oldWebhooks
            .filter(webhook => webhook.sourceChannel?.id === announcementID)
            .first();

        if (typeof existingAnnouncements !== 'undefined') {
            const alreadyAddedEmbed = new BetterEmbed(interaction)
                .setColor(Constants.colors.warning)
                .setTitle(replace(text.add.alreadyAdded.title, {
                    type: type,
                }))
                .setDescription(replace(text.add.alreadyAdded.description, {
                    type: type,
                    channel: Formatters.channelMention(channel.id),
                }));

            Log.interaction(interaction, `${type} announcement type was already added to ${channel.id}`);

            await interaction.editReply({ embeds: [alreadyAddedEmbed] });

            return;
        }

        const newsChannel = await interaction.client.channels.fetch(
            announcementID,
        ) as NewsChannel;

        await newsChannel.addFollower(channel);
        const webhooks = await channel.fetchWebhooks();

        const announcementWebhook = webhooks
            .filter(webhook => webhook.sourceChannel?.id === announcementID)
            .first()!;

        await announcementWebhook.edit({
            name: type,
            avatar: interaction.client.user?.avatarURL(),
        });

        const addEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(replace(text.add.title, {
                type: type,
            }))
            .setDescription(replace(text.add.description, {
                type: type,
                channel: Formatters.channelMention(channel.id),
            }));

        Log.interaction(interaction, `${type} announcements added to ${channel.id}`);

        await interaction.editReply({ embeds: [addEmbed] });
    }

    async function removeAnnouncement() {
        const webhooks = await channel.fetchWebhooks();
        const announcementWebhook = webhooks
            .filter(webhook => webhook.sourceChannel?.id === announcementID)
            .first();

        if (typeof announcementWebhook === 'undefined') {
            const notFoundEmbed = new BetterEmbed(interaction)
                .setColor(Constants.colors.warning)
                .setTitle(replace(text.remove.notFound.title, {
                    type: type,
                }))
                .setDescription(replace(text.remove.notFound.description, {
                    type: type,
                    channel: Formatters.channelMention(channel.id),
                }));

            Log.interaction(interaction, `${type} announcement type isn't added to ${channel.id}`);

            await interaction.editReply({ embeds: [notFoundEmbed] });

            return;
        }

        await announcementWebhook.delete();

        const removeEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(replace(text.remove.title, {
                type: type,
            }))
            .setDescription(replace(text.remove.description, {
                type: type,
                channel: Formatters.channelMention(channel.id),
            }));

        Log.interaction(interaction, `${type} announcements removed from ${channel.id}`);

        await interaction.editReply({ embeds: [removeEmbed] });
    }
};