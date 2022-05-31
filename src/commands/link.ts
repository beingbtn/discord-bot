import { BetterEmbed } from '../utility/BetterEmbed';
import {
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { Database } from '../utility/Database';
import { Options } from '../utility/Options';

export class TestCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'link',
            description: 'Links/unlinks a message ID to an ID',
            cooldownLimit: 0,
            cooldownDelay: 0,
            cooldownScope: BucketScope.User,
            preconditions: [
                'Base',
                'DevMode',
                'OwnerOnly',
            ],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand({
            name: 'link',
            description: 'Links/unlinks a message ID to an ID',
            options: [
                {
                    name: 'link',
                    type: 1,
                    description: 'Links a message ID to an ID',
                    options: [
                        {
                            name: 'category',
                            description: 'Used for the link option',
                            type: 3,
                            required: true,
                            choices: [
                                {
                                    name: 'News and Announcements',
                                    value: 'News and Announcements',
                                },
                                {
                                    name: 'SkyBlock Patch Notes',
                                    value: 'SkyBlock Patch Notes',
                                },
                                {
                                    name: 'Moderation Information and Changes',
                                    value: 'Moderation Information and Changes',
                                },
                            ],
                        },
                        {
                            name: 'id',
                            description: 'The ID to link the message to',
                            type: 3,
                            required: true,
                        },
                        {
                            name: 'message',
                            description: 'The message to link to the ID',
                            type: 3,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'unlink',
                    description: 'Unlinks a message ID from an ID',
                    type: 1,
                    options: [
                        {
                            name: 'category',
                            description: 'Used for the link option',
                            type: 3,
                            required: true,
                            choices: [
                                {
                                    name: 'News and Announcements',
                                    value: 'News and Announcements',
                                },
                                {
                                    name: 'SkyBlock Patch Notes',
                                    value: 'SkyBlock Patch Notes',
                                },
                                {
                                    name: 'Moderation Information and Changes',
                                    value: 'Moderation Information and Changes',
                                },
                            ],
                        },
                        {
                            name: 'id',
                            description: 'The ID to link the message to',
                            type: 3,
                            required: true,
                        },
                    ],
                },
            ],
        }, {
            guildIds: this.options.preconditions?.find(condition => condition === 'OwnerOnly')
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const category = interaction.options.getString('category', true);
        const id = interaction.options.getString('id', true);
        const message = interaction.options.getString('message', false);

        await Database.query(
            `UPDATE "${category}" SET message = $1 WHERE id = $2`,
            [message, id],
        );

        const linkEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(interaction.options.getSubcommand() === 'link'
                ? i18n.getMessage('commandsLinkLinkedTitle')
                : i18n.getMessage('commandsLinkUnlinkedTitle'),
            )
            .setDescription(interaction.options.getSubcommand() === 'link'
                ? i18n.getMessage('commandsLinkLinkedDescription', [
                    id,
                    message!,
                ])
                : i18n.getMessage('commandsLinkUnlinkedDescription', [
                    id,
                ]),
            );

        await interaction.editReply({ embeds: [linkEmbed] });
    }
}