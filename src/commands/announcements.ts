import type { CommandStatic } from '../@types/Command';
import { BetterEmbed } from '../utility/BetterEmbed';
import { ChannelTypes } from 'discord.js/typings/enums';
import { constants } from '../utility/constants';
import {
    CommandInteraction,
    Formatters,
    NewsChannel,
    Permissions,
    TextChannel,
} from 'discord.js';
import { Log } from '../utility/Log';
import process from 'node:process';

export default class implements CommandStatic {
    static command = 'announcements';
    static description = 'Configure what announcements you want to receive.';
    static cooldown = 5_000;
    static ephemeral = true;
    static noDM = true;
    static ownerOnly = false;
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
        name: 'announcements',
        description: 'Configure what announcements you want to receive',
        options: [
            {
                name: 'general',
                description: 'General Hypixel News and Announcements',
                type: 1,
                options: [
                    {
                        name: 'channel',
                        type: 7,
                        channel_types: [ChannelTypes.GUILD_TEXT],
                        description: 'The channel where Hypixel News and Announcements should be toggled',
                        required: true,
                    },
                ],
            },
            {
                name: 'skyblock',
                description: 'SkyBlock Patch Notes',
                type: 1,
                options: [
                    {
                        name: 'channel',
                        type: 7,
                        channel_types: [ChannelTypes.GUILD_TEXT],
                        description: 'The channel where SkyBlock Patch Notes should be toggled',
                        required: true,
                    },
                ],
            },
            {
                name: 'moderation',
                description: 'Moderation Information and Changes',
                type: 1,
                options: [
                    {
                        name: 'channel',
                        type: 7,
                        channel_types: [ChannelTypes.GUILD_TEXT],
                        description: 'The channel where Moderation Information and Changes should be toggled',
                        required: true,
                    },
                ],
            },
        ],
    };

    static async execute(interaction: CommandInteraction) {
        if (!interaction.inCachedGuild()) {
            return;
        }

        const { i18n } = interaction;

        const channel = interaction.options.getChannel('channel', true) as TextChannel;

        const userHasPermission = channel
            .permissionsFor(interaction.member)
            .has([
                Permissions.FLAGS.MANAGE_WEBHOOKS,
            ]);

        if (userHasPermission === false) {
            const missingPermission = new BetterEmbed(interaction)
                .setColor(constants.colors.warning)
                .setTitle(i18n.getMessage(
                    'commandsAnnouncementsUserMissingPermissionTitle',
                ))
                .setDescription(i18n.getMessage(
                    'commandsAnnouncementsUserMissingPermissionDescription',
                ));

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
                .setColor(constants.colors.warning)
                .setTitle(i18n.getMessage(
                    'commandsAnnouncementsBotMissingPermissionTitle',
                ))
                .setDescription(i18n.getMessage(
                    'commandsAnnouncementsBotMissingPermissionDescription', [
                    botHasPermission.join(', '),
                ],
                ));

            Log.interaction(interaction, 'Bot missing permission(s)');

            await interaction.editReply({ embeds: [missingPermission] });

            return;
        }

        const type = interaction.options.getSubcommand() === 'general'
            ? 'News and Announcements'
            : interaction.options.getSubcommand() === 'skyblock'
                ? 'SkyBlock Patch Notes'
                : 'Moderation Information and Changes';

        const channels = JSON.parse(process.env.ANNOUNCEMENTS!);
        const announcementID = channels[type].id as string;

        const oldWebhooks = await channel.fetchWebhooks();
        const existingAnnouncementWebhook = oldWebhooks
            .filter(webhook => webhook.sourceChannel?.id === announcementID)
            .first();

        if (existingAnnouncementWebhook) {
            //Remove webhook

            await existingAnnouncementWebhook.delete();

            const removeEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsAnnouncementsRemoveTitle', [
                    type,
                ]))
                .setDescription(i18n.getMessage('commandsAnnouncementsRemoveDescription', [
                    type,
                    Formatters.channelMention(channel.id),
                ]));

            Log.interaction(
                interaction,
                i18n.getMessage('commandsAnnouncementsRemoveLog', [
                    type,
                    channel.id,
                ],
                ));

            await interaction.editReply({ embeds: [removeEmbed] });
        } else {
            //Add webhook

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
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsAnnouncementsAddTitle', [
                    type,
                ]))
                .setDescription(
                    i18n.getMessage('commandsAnnouncementsAddDescription', [
                        type,
                        Formatters.channelMention(channel.id),
                    ],
                    ));

            Log.interaction(
                interaction,
                i18n.getMessage('commandsAnnouncementsAddLog', [
                    type,
                    channel.id,
                ],
                ));

            await interaction.editReply({ embeds: [addEmbed] });
        }
    }
}