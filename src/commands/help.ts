import type { CommandInteraction } from 'discord.js';
import type {
    Command,
    CommandStatic,
} from '../@types/Command';
import { BetterEmbed } from '../utility/BetterEmbed';
import { constants } from '../utility/constants';

export default class implements CommandStatic {
    static cooldown = 0;
    static ephemeral = true;
    static noDM = false;
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
        name: 'help',
        description: 'Displays helpful information and available commands',
        options: [
            {
                name: 'commands',
                type: 1,
                description: 'Displays information about commands',
                options: [
                    {
                        name: 'command',
                        type: 3,
                        description: 'A command to get info about. This parameter is completely optional',
                        required: false,
                        choices: [
                            {
                                name: '/announcements',
                                value: 'announcements',
                            },
                            {
                                name: '/help',
                                value: 'help',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'information',
                description: 'Returns information about this bot',
                type: 1,
            },
        ],
    };

    static async execute(interaction: CommandInteraction) {
        const { i18n } = interaction;

        if (interaction.options.getSubcommand() === 'information') {
            await information();
        } else if (interaction.options.getString('command')) {
            await specific();
        } else {
            await commands();
        }

        async function information() {
            const informationEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .addFields(
                    {
                        name: i18n.getMessage('commandsHelpInformationAboutName'),
                        value: i18n.getMessage('commandsHelpInformationAboutValue'),
                    },
                    {
                        name: i18n.getMessage('commandsHelpInformationLegalName'),
                        value: i18n.getMessage('commandsHelpInformationLegalValue'),
                    },
                );

            await interaction.editReply({ embeds: [informationEmbed] });
        }

        async function specific() {
            const commandArg =
                interaction.options.getString('command', true);
            const command: Command | undefined =
                interaction.client.commands.get(commandArg);
            const commandSearchEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal);

            if (typeof command === 'undefined') {
                commandSearchEmbed
                    .setColor(constants.colors.warning)
                    .setTitle(i18n.getMessage('commandsHelpSpecificInvalidTitle'))
                    .setDescription(i18n.getMessage('commandsHelpSpecificInvalidDescription', [
                        commandArg,
                    ]));

                await interaction.editReply({ embeds: [commandSearchEmbed] });
                return;
            }

            commandSearchEmbed.setTitle(
                i18n.getMessage('commandsHelpSpecificTitle', [
                    commandArg,
                ]),
            );

            commandSearchEmbed.setDescription(
                command.structure.description,
            );

            commandSearchEmbed.addFields({
                name: i18n.getMessage('commandsHelpSpecificCooldownName'),
                value: i18n.getMessage('commandsHelpSpecificCooldownValue', [
                    command.cooldown / constants.ms.second,
                ]),
            });

            if (command.noDM === true) {
                commandSearchEmbed.addFields({
                    name: i18n.getMessage('commandsHelpSpecificDMName'),
                    value: i18n.getMessage('commandsHelpSpecificDMValue'),
                });
            }

            if (command.ownerOnly === true) {
                commandSearchEmbed.addFields({
                    name: i18n.getMessage('commandsHelpSpecificOwnerName'),
                    value: i18n.getMessage('commandsHelpSpecificOwnerValue'),
                });
            }

            await interaction.editReply({ embeds: [commandSearchEmbed] });
        }

        async function commands() {
            const commandsCollection = interaction.client.commands.filter(
                command => command.ownerOnly === false,
            );
            const allCommandsEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsHelpAllTitle'));

            for (const command of commandsCollection.values()) {
                allCommandsEmbed.addFields({
                    name: i18n.getMessage('commandsHelpAllName', [
                        command.structure.description,
                    ]),
                    value: command.structure.description,
                });
            }

            await interaction.editReply({ embeds: [allCommandsEmbed] });
        }
    }
}