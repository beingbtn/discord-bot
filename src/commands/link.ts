import type { CommandInteraction } from 'discord.js';
import type { CommandStatic } from '../@types/Command';
import { BetterEmbed } from '../utility/BetterEmbed';
import { constants } from '../utility/constants';
import { Database } from '../utility/Database';

export default class implements CommandStatic {
    static cooldown = 0;
    static ephemeral = true;
    static noDM = false;
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
    };

    static async execute(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const category = interaction.options.getString('category', true);
        const id = interaction.options.getString('id', true);
        const message = interaction.options.getString('message', false);

        await Database.query(
            `UPDATE "${category}" SET message = $1 WHERE id = $2`,
            [message, id],
        );

        const linkEmbed = new BetterEmbed(interaction)
            .setColor(constants.colors.normal)
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