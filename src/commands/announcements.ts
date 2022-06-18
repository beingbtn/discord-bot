import {
    type ApplicationCommandRegistry,
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { ChannelTypes } from 'discord.js/typings/enums';
import {
    type CommandInteraction,
    Formatters,
    type NewsChannel,
    Permissions,
    type TextChannel,
} from 'discord.js';
import process from 'node:process';
import { BetterEmbed } from '../structures/BetterEmbed';
import { Categories } from '../enums/Categories';
import { Log } from '../structures/Log';
import { Options } from '../utility/Options';
import { Preconditions } from '../enums/Preconditions';
import { Time } from '../enums/Time';

export class AnnouncementsCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'announcements',
            description: 'Configure what announcements you want to receive',
            cooldownLimit: 3,
            cooldownDelay: Time.Second * 10,
            cooldownScope: BucketScope.Guild,
            preconditions: [
                Preconditions.Base,
                Preconditions.DevMode,
                Preconditions.GuildOnly,
            ],
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
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
        }, {
            guildIds: this.options.preconditions?.find(
                (condition) => condition === Preconditions.OwnerOnly,
            )
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
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
                .setColor(Options.colorsWarning)
                .setTitle(
                    i18n.getMessage(
                        'commandsAnnouncementsUserMissingPermissionTitle',
                    ),
                )
                .setDescription(
                    i18n.getMessage(
                        'commandsAnnouncementsUserMissingPermissionDescription',
                    ),
                );

            Log.command(
                interaction,
                i18n.getMessage(
                    'commandsAnnouncementsUserMissingPermissionLog',
                ),
            );

            await interaction.editReply({
                embeds: [missingPermission],
            });

            return;
        }

        const botMissingPermissions = channel
            .permissionsFor(interaction.guild.me!)
            .missing([
                Permissions.FLAGS.VIEW_CHANNEL,
                Permissions.FLAGS.MANAGE_WEBHOOKS,
            ]);

        if (botMissingPermissions.length !== 0) {
            const missingPermission = new BetterEmbed(interaction)
                .setColor(Options.colorsWarning)
                .setTitle(
                    i18n.getMessage(
                        'commandsAnnouncementsBotMissingPermissionTitle',
                    ),
                )
                .setDescription(
                    i18n.getMessage(
                        'commandsAnnouncementsBotMissingPermissionDescription', [
                            botMissingPermissions.join(', '),
                        ],
                    ),
                );

            Log.command(
                interaction,
                i18n.getMessage(
                    'commandsAnnouncementsBotMissingPermissionLog',
                ),
            );

            await interaction.editReply({
                embeds: [missingPermission],
            });

            return;
        }

        let type: string;

        switch (interaction.options.getSubcommand()) {
            case 'general': type = Categories.NewsAndAnnouncements;
                break;
            case 'skyblock': type = Categories.SkyBlockPatchNotes;
                break;
            default: type = Categories.ModerationInformationAndChanges;
            // no default
        }

        const channels = JSON.parse(process.env.ANNOUNCEMENTS!);
        const announcementID = channels[type].id as string;

        const oldWebhooks = await channel.fetchWebhooks();
        const existingAnnouncementWebhook = oldWebhooks
            .filter((webhook) => webhook.sourceChannel?.id === announcementID)
            .first();

        if (typeof existingAnnouncementWebhook === 'undefined') {
            // Add webhook

            const newsChannel = await interaction.client.channels.fetch(
                announcementID,
            ) as NewsChannel;

            await newsChannel.addFollower(channel);
            const webhooks = await channel.fetchWebhooks();

            const announcementWebhook = webhooks
                .filter((webhook) => webhook.sourceChannel?.id === announcementID)
                .first()!;

            await announcementWebhook.edit({
                name: type,
                avatar: interaction.client.user?.avatarURL(),
            });

            const addEmbed = new BetterEmbed(interaction)
                .setColor(Options.colorsNormal)
                .setTitle(
                    i18n.getMessage(
                        'commandsAnnouncementsAddTitle', [
                            type,
                        ],
                    ),
                )
                .setDescription(
                    i18n.getMessage(
                        'commandsAnnouncementsAddDescription', [
                            type,
                            Formatters.channelMention(channel.id),
                        ],
                    ),
                );

            Log.command(
                interaction,
                i18n.getMessage(
                    'commandsAnnouncementsAddLog', [
                        type,
                        channel.id,
                    ],
                ),
            );

            await interaction.editReply({ embeds: [addEmbed] });
        } else {
            // Remove webhook

            await existingAnnouncementWebhook.delete();

            const removeEmbed = new BetterEmbed(interaction)
                .setColor(Options.colorsNormal)
                .setTitle(
                    i18n.getMessage(
                        'commandsAnnouncementsRemoveTitle', [
                            type,
                        ],
                    ),
                )
                .setDescription(
                    i18n.getMessage(
                        'commandsAnnouncementsRemoveDescription', [
                            type,
                            Formatters.channelMention(channel.id),
                        ],
                    ),
                );

            Log.command(
                interaction,
                i18n.getMessage(
                    'commandsAnnouncementsRemoveLog', [
                        type,
                        channel.id,
                    ],
                ),
            );

            await interaction.editReply({ embeds: [removeEmbed] });
        }
    }
}