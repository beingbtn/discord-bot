import {
    type ApplicationCommandRegistry,
    BucketScope,
    Command,
} from '@sapphire/framework';
import { type CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { BetterEmbed } from '../structures/BetterEmbed';
import { Options } from '../utility/Options';
import { interactionLogContext } from '../utility/utility';

export class ConfigCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'config',
            description: 'Configure and change settings',
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

        this.chatInputStructure = {
            name: this.name,
            description: this.description,
            options: [
                {
                    name: 'devmode',
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: 'Toggle Developer Mode',
                },
                {
                    name: 'ownerguilds',
                    description: 'Set the guild(s) where owner commands should be set',
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: 'guilds',
                            type: ApplicationCommandOptionTypes.STRING,
                            description: 'The Ids of the guilds separated by a comma (no spaces)',
                            required: true,
                        },
                    ],
                },
                {
                    name: 'owners',
                    description: 'Set the application owner(s)',
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: 'owners',
                            type: ApplicationCommandOptionTypes.STRING,
                            description: 'The Ids of the owners separated by a comma (no spaces)',
                            required: true,
                        },
                    ],
                },
                {
                    name: 'view',
                    description: 'View the current configuration',
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                },
            ],
        };
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(
            this.chatInputStructure,
            Options.commandRegistry(this),
        );
    }

    public async chatInputRun(interaction: CommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'devmode':
                await this.devModeCommand(interaction);
                break;
            case 'ownerguilds':
                await this.ownerGuilds(interaction);
                break;
            case 'owners':
                await this.owners(interaction);
                break;
            case 'view':
                await this.view(interaction);
                break;
            // no default
        }
    }

    public async devModeCommand(interaction: CommandInteraction) {
        const { i18n } = interaction;

        this.container.config.devMode = !this.container.config.devMode;

        await this.container.database.config.update({
            data: {
                devMode: this.container.config.devMode,
            },
            where: {
                index: 0,
            },
        });

        const devModeEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsConfigDevModeTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsConfigDevModeDescription', [
                        this.container.config.devMode === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                    ],
                ),
            );

        await interaction.editReply({ embeds: [devModeEmbed] });

        const state = this.container.config.devMode === true
            ? 'on'
            : 'off';

        this.container.logger.info(
            interactionLogContext(interaction),
            `${this.constructor.name}:`,
            `Developer Mode is now ${state}.`,
        );
    }

    public async ownerGuilds(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const guilds = interaction.options.getString(
            'guilds',
            true,
        ).split(',');

        this.container.config.ownerGuilds = guilds;

        await this.container.database.config.update({
            data: {
                ownerGuilds: this.container.config.ownerGuilds,
            },
            where: {
                index: 0,
            },
        });

        const ownerGuildsEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsConfigOwnerGuildsTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsConfigOwnerGuildsDescription', [
                        guilds.join(', '),
                    ],
                ),
            );

        await interaction.editReply({ embeds: [ownerGuildsEmbed] });

        this.container.logger.info(
            interactionLogContext(interaction),
            `${this.constructor.name}:`,
            `The owner guilds are now ${guilds.join(', ')}.`,
        );
    }

    public async owners(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const owners = interaction.options.getString(
            'owners',
            true,
        ).split(',');

        this.container.config.owners = owners;

        await this.container.database.config.update({
            data: {
                owners: this.container.config.owners,
            },
            where: {
                index: 0,
            },
        });

        const ownersEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsConfigOwnersTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsConfigOwnersDescription', [
                        owners.join(', '),
                    ],
                ),
            );

        await interaction.editReply({ embeds: [ownersEmbed] });

        this.container.logger.info(
            interactionLogContext(interaction),
            `${this.constructor.name}:`,
            `The owners are now ${owners.join(', ')}.`,
        );
    }

    public async view(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const viewEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsConfigViewTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsConfigViewDescription', [
                        this.container.config.devMode === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                        this.container.config.ownerGuilds.join(', '),
                        this.container.config.owners.join(', '),

                    ],
                ),
            );

        await interaction.editReply({ embeds: [viewEmbed] });
    }
}