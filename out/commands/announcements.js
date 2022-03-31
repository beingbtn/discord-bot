"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const utility_1 = require("../utility/utility");
const Constants_1 = require("../utility/Constants");
const discord_js_1 = require("discord.js");
const Log_1 = require("../utility/Log");
const RegionLocales_1 = require("../locales/RegionLocales");
exports.properties = {
    name: 'announcements',
    description: 'Configure what announcements you want to receive.',
    cooldown: 10000,
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
                                channel_types: [0 /* GUILD_TEXT */],
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
                                channel_types: [0 /* GUILD_TEXT */],
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
                                channel_types: [0 /* GUILD_TEXT */],
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
                                channel_types: [0 /* GUILD_TEXT */],
                                description: 'Choose the channel you want announcements to stop being sent to',
                                required: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: 'moderation',
                description: 'Moderation Information and Changes',
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
                                channel_types: [0 /* GUILD_TEXT */],
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
                                channel_types: [0 /* GUILD_TEXT */],
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
const execute = async (interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.announcements;
    const { replace } = RegionLocales_1.RegionLocales;
    const channel = interaction.options.getChannel('channel', true);
    const userHasPermission = channel
        .permissionsFor(interaction.member)
        .has([
        discord_js_1.Permissions.FLAGS.MANAGE_WEBHOOKS,
    ]);
    if (userHasPermission === false) {
        const missingPermission = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.warning)
            .setTitle(text.userMissingPermission.title)
            .setDescription(text.userMissingPermission.description);
        Log_1.Log.interaction(interaction, 'User missing permission');
        await interaction.editReply({ embeds: [missingPermission] });
        return;
    }
    const botHasPermission = channel
        .permissionsFor(interaction.guild.me)
        .missing([
        discord_js_1.Permissions.FLAGS.VIEW_CHANNEL,
        discord_js_1.Permissions.FLAGS.MANAGE_WEBHOOKS,
    ]);
    if (botHasPermission.length > 0) {
        const missingPermission = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.warning)
            .setTitle(text.botMissingPermission.title)
            .setDescription(replace(text.botMissingPermission.description, {
            permissions: botHasPermission,
        }));
        Log_1.Log.interaction(interaction, 'Bot missing permission(s)');
        await interaction.editReply({ embeds: [missingPermission] });
        return;
    }
    const type = interaction.options.getSubcommandGroup() === 'general'
        ? 'News and Announcements'
        : interaction.options.getSubcommandGroup() === 'skyblock'
            ? 'SkyBlock Patch Notes'
            : 'Moderation Information and Changes';
    const channels = JSON.parse(process.env.ANNOUNCEMENTS);
    const announcementID = channels[type].id;
    switch (interaction.options.getSubcommand()) {
        case 'add':
            await addAnnouncement();
            break;
        case 'remove':
            await removeAnnouncement();
            break;
        //No default
    }
    async function addAnnouncement() {
        const oldWebhooks = await channel.fetchWebhooks();
        const existingAnnouncements = oldWebhooks
            .filter(webhook => webhook.sourceChannel?.id === announcementID)
            .first();
        if (typeof existingAnnouncements !== 'undefined') {
            const alreadyAddedEmbed = new utility_1.BetterEmbed(interaction)
                .setColor(Constants_1.Constants.colors.warning)
                .setTitle(replace(text.add.alreadyAdded.title, {
                type: type,
            }))
                .setDescription(replace(text.add.alreadyAdded.description, {
                type: type,
                channel: discord_js_1.Formatters.channelMention(channel.id),
            }));
            Log_1.Log.interaction(interaction, `${type} announcement type was already added to ${channel.id}`);
            await interaction.editReply({ embeds: [alreadyAddedEmbed] });
            return;
        }
        const newsChannel = await interaction.client.channels.fetch(announcementID);
        await newsChannel.addFollower(channel);
        const webhooks = await channel.fetchWebhooks();
        const announcementWebhook = webhooks
            .filter(webhook => webhook.sourceChannel?.id === announcementID)
            .first();
        await announcementWebhook.edit({
            name: type,
            avatar: interaction.client.user?.avatarURL(),
        });
        const addEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(replace(text.add.title, {
            type: type,
        }))
            .setDescription(replace(text.add.description, {
            type: type,
            channel: discord_js_1.Formatters.channelMention(channel.id),
        }));
        Log_1.Log.interaction(interaction, `${type} announcements added to ${channel.id}`);
        await interaction.editReply({ embeds: [addEmbed] });
    }
    async function removeAnnouncement() {
        const webhooks = await channel.fetchWebhooks();
        const announcementWebhook = webhooks
            .filter(webhook => webhook.sourceChannel?.id === announcementID)
            .first();
        if (typeof announcementWebhook === 'undefined') {
            const notFoundEmbed = new utility_1.BetterEmbed(interaction)
                .setColor(Constants_1.Constants.colors.warning)
                .setTitle(replace(text.remove.notFound.title, {
                type: type,
            }))
                .setDescription(replace(text.remove.notFound.description, {
                type: type,
                channel: discord_js_1.Formatters.channelMention(channel.id),
            }));
            Log_1.Log.interaction(interaction, `${type} announcement type isn't added to ${channel.id}`);
            await interaction.editReply({ embeds: [notFoundEmbed] });
            return;
        }
        await announcementWebhook.delete();
        const removeEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(replace(text.remove.title, {
            type: type,
        }))
            .setDescription(replace(text.remove.description, {
            type: type,
            channel: discord_js_1.Formatters.channelMention(channel.id),
        }));
        Log_1.Log.interaction(interaction, `${type} announcements removed from ${channel.id}`);
        await interaction.editReply({ embeds: [removeEmbed] });
    }
};
exports.execute = execute;
