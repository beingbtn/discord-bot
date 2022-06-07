import {
    awaitComponent,
    disableComponents,
} from '../utility/utility';
import { BetterEmbed } from '../utility/BetterEmbed';
import {
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import {
    Constants as DiscordConstants,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed,
} from 'discord.js';
import { Log } from '../utility/Log';
import { Options } from '../utility/Options';
import { Time } from '../enums/Time';

export class EditAnnouncementsCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'editannouncements',
            description: 'Edit announcements',
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
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand({
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
                    description: 'Whether to crosspost the announcement, if not already (defaults to true)',
                    type: 5,
                    required: false,
                },
            ],
        }, {
            guildIds: this.options.preconditions?.find(
                    condition => condition === 'OwnerOnly',
                )
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const messageID = interaction.options.getString('message', true);
        const title = interaction.options.getString('title', false);
        const description = interaction.options.getString('description', false);
        const image = interaction.options.getString('image', false);
        const url = interaction.options.getString('url', false);

        const message = await interaction.channel!.messages.fetch(messageID);

        const tempEmbed = new MessageEmbed(message.embeds[0]);

        if (title !== null) {
            tempEmbed.setTitle(title);
        }

        if (description !== null) {
            tempEmbed.setDescription(description);
        }

        if (image !== null) {
            tempEmbed.setImage(image);
        }

        if (url !== null) {
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
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsEditAnnouncementsPreviewTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsEditAnnouncementsPreviewDescription',
                ),
            );

        const reply = await interaction.followUp({
            embeds: [previewEmbed, ...message.embeds],
            components: [button],
        });

        const componentFilter = (i: MessageComponentInteraction) =>
            interaction.user.id === i.user.id && i.message.id === reply.id;

        await interaction.client.channels.fetch(interaction.channelId);

        const disabledRows = disableComponents([button]);

        const previewButton = await awaitComponent(interaction.channel!, {
            componentType: 'BUTTON',
            filter: componentFilter,
            idle: Time.Minute,
        });

        if (previewButton === null) {
            await interaction.editReply({
                components: disabledRows,
            });

            return;
        }

        Log.command(
            interaction,
            i18n.getMessage(
                'commandsEditAnnouncementsLogEditing',
            ),
        );

        const editedAnnouncement = await message.edit({
            embeds: message.embeds,
        });

        //Case for when a channel is converted to an announcement channel
        if (
            editedAnnouncement.crosspostable === true &&
            interaction.options.getBoolean('crosspost', false) !== false
        ) {
            await editedAnnouncement.crosspost();
        }

        Log.command(
            interaction,
            i18n.getMessage(
                'commandsEditAnnouncementsLogPublished',
            ),
        );

        const successEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsEditAnnouncementsSuccessTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsEditAnnouncementsSuccessDescription',
                ),
            );

        await previewButton.update({
            embeds: [successEmbed],
            components: disabledRows,
        });
    }
}