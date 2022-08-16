import {
    type ApplicationCommandRegistry,
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import {
    type CommandInteraction,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    type TextChannel,
} from 'discord.js';
import {
    ApplicationCommandOptionTypes,
    ChannelTypes,
    MessageButtonStyles,
} from 'discord.js/typings/enums';
import { CustomID } from '../@types/Persistent';
import { Event } from '../enums/Event';
import { BetterEmbed } from '../structures/BetterEmbed';
import { Options } from '../utility/Options';

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
                'Base',
                'DevMode',
                'OwnerOnly',
                'GuildOnly',
            ],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
        });

        this.chatInputStructure = {
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'channel',
                    description: 'The channel to add the selector to',
                    type: ApplicationCommandOptionTypes.CHANNEL,
                    channel_types: [ChannelTypes.GUILD_TEXT],
                    required: true,
                },
            ],
        };
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(this.chatInputStructure, {
            guildIds: this.options.preconditions?.find(
                (condition) => condition === 'OwnerOnly',
            )
                ? this.container.config.ownerGuilds
                : undefined,
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
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

        const actionRow = new MessageActionRow()
            .setComponents(
                this.container.announcements.map(
                    (announcement) => new MessageButton()
                        .setCustomId(JSON.stringify({
                            event: Event.PersistentNotification,
                            value: announcement.category,
                        } as CustomID))
                        .setLabel(announcement.category)
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