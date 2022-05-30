import { BetterEmbed } from '../utility/BetterEmbed';
import {
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { Constants } from '../utility/Constants';
import { Options } from '../utility/Options';

export class TestCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'help',
            description: 'Displays helpful information and available commands',
            cooldownDelay: 0,
            preconditions: [
                'i18n',
                'DeferReply',
                'DevMode',
            ],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand({
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
        }, {
            guildIds: this.options.preconditions?.find(condition => condition === 'OwnerOnly')
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        if (interaction.options.getSubcommand() === 'information') {
            await this.information(interaction);
        } else if (interaction.options.getString('command')) {
            await this.specific(interaction);
        } else {
            await this.commands(interaction);
        }
    }

    public async information(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;
        const informationEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
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

    public async specific(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const commandArg = interaction.options.getString(
            'command',
            true,
        );

        const command = this.container.stores
            .get('commands')
            .get(commandArg);

        const commandSearchEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal);

        if (typeof command === 'undefined') {
            commandSearchEmbed
                .setColor(Options.colorsWarning)
                .setTitle(i18n.getMessage('commandsHelpSpecificInvalidTitle'))
                .setDescription(i18n.getMessage(
                    'commandsHelpSpecificInvalidDescription', [
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
            command.description,
        );

        commandSearchEmbed.addFields({
            name: i18n.getMessage('commandsHelpSpecificCooldownName'),
            value: i18n.getMessage('commandsHelpSpecificCooldownValue', [
                command.options.cooldownDelay! / Constants.msSecond,
            ]),
        });

        const GuildOnly = command.options.preconditions?.find(
            condition => condition === 'GuildOnly',
        );

        const ownerOnly = command.options.preconditions?.find(
            condition => condition === 'OwnerOnly',
        );

        if (typeof GuildOnly !== 'undefined') {
            commandSearchEmbed.addFields({
                name: i18n.getMessage('commandsHelpSpecificDMName'),
                value: i18n.getMessage('commandsHelpSpecificDMValue'),
            });
        }

        if (typeof ownerOnly !== 'undefined') {
            commandSearchEmbed.addFields({
                name: i18n.getMessage('commandsHelpSpecificOwnerName'),
                value: i18n.getMessage('commandsHelpSpecificOwnerValue'),
            });
        }

        await interaction.editReply({ embeds: [commandSearchEmbed] });
    }

    public async commands(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const commandsCollection = this.container.stores
            .get('commands');

        const allCommandsEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(i18n.getMessage('commandsHelpAllTitle'));

        for (const command of commandsCollection.values()) {
            if (command.preconditions.entries) {
                allCommandsEmbed.addFields({
                    name: i18n.getMessage('commandsHelpAllName', [
                        command.name,
                    ]),
                    value: command.description,
                });
            }
        }

        await interaction.editReply({ embeds: [allCommandsEmbed] });
    }
}