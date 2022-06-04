import { BetterEmbed } from '../utility/BetterEmbed';
import {
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { Database } from '../utility/Database';
import { Log } from '../utility/Log';
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

    public override registerApplicationCommands(registry: Command.Registry) {
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
                    name: 'view',
                    description: 'View the current configuration',
                    type: 1,
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
            case 'view':
                await this.view(interaction);
                break;
            //no default
        }
    }

    public async core(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        this.container.config.core = !this.container.config.core;

        await Database.query(
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

        Log.command(interaction, coreEmbed.description);
    }

    public async devModeCommand(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        this.container.config.devMode = !this.container.config.devMode;

        await Database.query(
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

        Log.command(interaction, devModeEmbed.description);
    }

    public async interval(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const milliseconds = interaction.options.getInteger(
            'milliseconds',
            true,
        );

        this.container.config.interval = milliseconds;

        await Database.query(
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

        Log.command(interaction, intervalEmbed.description);
    }

    public async restRequestTimeout(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const milliseconds = interaction.options.getInteger(
            'milliseconds',
            true,
        );

        this.container.config.restRequestTimeout = milliseconds;

        await Database.query(
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

        Log.command(
            interaction,
            restRequestTimeoutEmbed.description,
        );
    }

    public async retryLimit(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const limit = interaction.options.getInteger(
            'limit',
            true,
        );

        this.container.config.retryLimit = limit;

        await Database.query(
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

        Log.command(interaction, retryLimitEmbed.description);
    }

    public async view(interaction: Command.ChatInputInteraction) {
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
                    ],
                ),
            );

        await interaction.editReply({ embeds: [viewEmbed] });
    }
}