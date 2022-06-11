import { BetterEmbed } from '../structures/BetterEmbed';
import {
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import {
    ChannelTypes,
    MessageButtonStyles,
} from 'discord.js/typings/enums';
import { CustomID } from '../@types/Persistent';
import { Events } from '../enums/Events';
import {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
} from 'discord.js';
import { Options } from '../utility/Options';
import { Preconditions } from '../enums/Preconditions';

export class NotificationsCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'notifications',
            description: 'Add a notifications selector to a channel',
            cooldownLimit: 0,
            cooldownDelay: 0,
            cooldownScope: BucketScope.User,
            preconditions: [
                Preconditions.Base,
                Preconditions.DevMode,
                Preconditions.OwnerOnly,
                Preconditions.GuildTextOnly,
            ],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand({
            name: 'notifications',
            description: 'Add a notifications selector to a channel',
            options: [
                {
                    name: 'channel',
                    description: 'The channel to add the selector to',
                    type: 7,
                    channel_types: [ChannelTypes.GUILD_TEXT],
                    required: true,
                },
            ],
        }, {
            guildIds: this.options.preconditions?.find(
                    condition => condition === Preconditions.OwnerOnly,
                )
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const notificationsEmbed = new MessageEmbed()
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsNotificationsPublicTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsNotificationsPublicDescription',
                ),
            );

        const announcements = JSON.parse(process.env.ANNOUNCEMENTS!) as {
            [key: string]: {
                id: string,
            }
        };

        const actionRow = new MessageActionRow()
            .setComponents(
                Object.entries(announcements).map(
                    ([key]) => new MessageButton()
                        .setCustomId(JSON.stringify({
                            event: Events.PersistentNotification,
                            value: key,
                        } as CustomID))
                        .setLabel(key)
                        .setStyle(MessageButtonStyles.PRIMARY),
                ),
            );

        const channel = interaction.options.getChannel(
            'channel',
            true,
        ) as TextChannel;

        await channel.send({
            embeds: [notificationsEmbed],
            components: [actionRow],
        });

        const embed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsNotificationsPrivateTitle',
                ),
            );

        await interaction.editReply({
            embeds: [embed],
        });
    }
}