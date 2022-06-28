import {
    type ApplicationCommandRegistry,
    BucketScope,
    RegisterBehavior,
} from '@sapphire/framework';
import { type CommandInteraction } from 'discord.js';
import { BetterEmbed } from '../structures/BetterEmbed';
import { Command } from '../structures/Command';
import { Options } from '../utility/Options';

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
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: 'config',
            description: 'Configure and change settings',
            options: [
                {
                    name: 'core',
                    type: 1,
                    description: 'Toggle the core',
                },
                {
                    name: 'devmode',
                    type: 1,
                    description: 'Toggle Developer Mode',
                },
                {
                    name: 'interval',
                    description: 'Set the RSS fetch interval',
                    type: 1,
                    options: [
                        {
                            name: 'milliseconds',
                            type: 4,
                            description: 'The interval in milliseconds',
                            required: true,
                            minValue: 60,
                            maxValue: 3600000,
                        },
                    ],
                },
                {
                    name: 'restrequesttimeout',
                    description: 'Set the request timeout before an abort error is thrown',
                    type: 1,
                    options: [
                        {
                            name: 'milliseconds',
                            type: 4,
                            description: 'The timeout in milliseconds',
                            required: true,
                            minValue: 0,
                            maxValue: 100000,
                        },
                    ],
                },
                {
                    name: 'retrylimit',
                    description: 'Set the number of request retries before throwing',
                    type: 1,
                    options: [
                        {
                            name: 'limit',
                            type: 4,
                            description: 'The number of retries',
                            required: true,
                            minValue: 0,
                            maxValue: 100,
                        },
                    ],
                },
                {
                    name: 'ownerguilds',
                    description: 'Set the guild(s) where owner commands should be set',
                    type: 1,
                    options: [
                        {
                            name: 'guilds',
                            type: 3,
                            description: 'The IDs of the guilds separated by a comma (no spaces)',
                            required: true,
                        },
                    ],
                },
                {
                    name: 'owners',
                    description: 'Set the application owner(s)',
                    type: 1,
                    options: [
                        {
                            name: 'owners',
                            type: 3,
                            description: 'The IDs of the owners separated by a comma (no spaces)',
                            required: true,
                        },
                    ],
                },
                {
                    name: 'view',
                    description: 'View the current configuration',
                    type: 1,
                },
            ],
        }, {
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
        switch (interaction.options.getSubcommand()) {
            case 'core':
                await this.core(interaction);
                break;
            case 'devmode':
                await this.devModeCommand(interaction);
                break;
            case 'interval':
                await this.interval(interaction);
                break;
            case 'restrequesttimeout':
                await this.restRequestTimeout(interaction);
                break;
            case 'retrylimit':
                await this.retryLimit(interaction);
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

    public async core(interaction: CommandInteraction) {
        const { i18n } = interaction;

        this.container.config.core = !this.container.config.core;

        await this.container.database.query(
            'UPDATE config SET "core" = $1 WHERE index = 0',
            [this.container.config.core],
        );

        const coreEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(i18n.getMessage('commandsConfigCoreTitle'))
            .setDescription(
                i18n.getMessage(
                    'commandsConfigCoreDescription', [
                        this.container.config.core === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                    ],
                ),
            );

        await interaction.editReply({
            embeds: [coreEmbed],
        });

        const state = this.container.config.core === true
            ? 'on'
            : 'off';

        this.container.logger.info(
            this.logContext(interaction),
            `${this.constructor.name}:`,
            `Developer Mode is now ${state}.`,
        );
    }

    public async devModeCommand(interaction: CommandInteraction) {
        const { i18n } = interaction;

        this.container.config.devMode = !this.container.config.devMode;

        await this.container.database.query(
            'UPDATE config SET "devMode" = $1 WHERE index = 0',
            [this.container.config.devMode],
        );

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
            this.logContext(interaction),
            `${this.constructor.name}:`,
            `Developer Mode is now ${state}.`,
        );
    }

    public async interval(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const milliseconds = interaction.options.getInteger(
            'milliseconds',
            true,
        );

        this.container.config.interval = milliseconds;

        await this.container.database.query(
            'UPDATE config SET "interval" = $1 WHERE index = 0',
            [this.container.config.interval],
        );

        const intervalEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsConfigIntervalTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsConfigIntervalDescription', [
                        milliseconds,
                    ],
                ),
            );

        await interaction.editReply({ embeds: [intervalEmbed] });

        this.container.logger.info(
            this.logContext(interaction),
            `${this.constructor.name}:`,
            `The interval is now ${milliseconds}ms.`,
        );
    }

    public async restRequestTimeout(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const milliseconds = interaction.options.getInteger(
            'milliseconds',
            true,
        );

        this.container.config.restRequestTimeout = milliseconds;

        await this.container.database.query(
            'UPDATE config SET "restRequestTimeout" = $1 WHERE index = 0',
            [this.container.config.restRequestTimeout],
        );

        const restRequestTimeoutEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsConfigRestRequestTimeoutTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsConfigRestRequestTimeoutDescription', [
                        milliseconds,
                    ],
                ),
            );

        await interaction.editReply({
            embeds: [restRequestTimeoutEmbed],
        });

        this.container.logger.info(
            this.logContext(interaction),
            `${this.constructor.name}:`,
            `The rest request timeout is now ${milliseconds}ms.`,
        );
    }

    public async retryLimit(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const limit = interaction.options.getInteger(
            'limit',
            true,
        );

        this.container.config.retryLimit = limit;

        await this.container.database.query(
            'UPDATE config SET "retryLimit" = $1 WHERE index = 0',
            [this.container.config.retryLimit],
        );

        const retryLimitEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsConfigRetryLimitTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsConfigRetryLimitDescription', [
                        limit,
                    ],
                ),
            );

        await interaction.editReply({ embeds: [retryLimitEmbed] });

        this.container.logger.info(
            this.logContext(interaction),
            `${this.constructor.name}:`,
            `The retry limit is now ${limit}.`,
        );
    }

    public async ownerGuilds(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const guilds = interaction.options.getString(
            'guilds',
            true,
        ).split(',');

        this.container.config.ownerGuilds = guilds;

        await this.container.database.query(
            'UPDATE config SET "ownerGuilds" = $1 WHERE index = 0',
            [this.container.config.ownerGuilds],
        );

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
            this.logContext(interaction),
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

        await this.container.database.query(
            'UPDATE config SET "owners" = $1 WHERE index = 0',
            [this.container.config.owners],
        );

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
            this.logContext(interaction),
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
                        this.container.config.core === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                        this.container.config.devMode === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                        this.container.config.interval,
                        this.container.config.restRequestTimeout,
                        this.container.config.retryLimit,
                        this.container.config.ownerGuilds.join(', '),
                        this.container.config.owners.join(', '),

                    ],
                ),
            );

        await interaction.editReply({ embeds: [viewEmbed] });
    }
}