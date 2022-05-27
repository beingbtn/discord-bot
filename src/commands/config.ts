import type { CommandStatic } from '../@types/Command';
import type {
    CommandInteraction,
    WebhookEditMessageOptions,
} from 'discord.js';
import { BetterEmbed } from '../utility/BetterEmbed';
import { constants } from '../utility/constants';
import { Database } from '../utility/Database';
import { Log } from '../utility/Log';

export default class implements CommandStatic {
    static command = 'config';
    static description = 'Configure and change settings.';
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
    };

    static async execute(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const payload: WebhookEditMessageOptions = {};

        const client = interaction.client;

        switch (interaction.options.getSubcommand()) {
            case 'core':
                await coreCommand();
                break;
            case 'devmode':
                await devModeCommand();
                break;
            case 'interval':
                await interval();
                break;
            case 'restrequesttimeout':
                await restRequestTimeoutCommand();
                break;
            case 'retrylimit':
                await retryLimitCommand();
                break;
            case 'view':
                viewCommand();
                break;
            //no default
        }

        async function coreCommand() {
            client.config.core = !client.config.core;

            await Database.query(
                'UPDATE config SET "core" = $1 WHERE index = 0',
                [client.config.core],
            );

            const coreEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsConfigCoreTitle'))
                .setDescription(
                    i18n.getMessage('commandsConfigCoreDescription', [
                        client.config.core === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                    ]),
                );

            payload.embeds = [coreEmbed];

            Log.interaction(interaction, coreEmbed.description);
        }

        async function devModeCommand() {
            client.config.devMode = !client.config.devMode;

            await Database.query(
                'UPDATE config SET "devMode" = $1 WHERE index = 0',
                [client.config.devMode],
            );

            const devModeEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsConfigDevModeTitle'))
                .setDescription(
                    i18n.getMessage('commandsConfigDevModeDescription', [
                        client.config.devMode === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                    ]),
                );

            payload.embeds = [devModeEmbed];

            Log.interaction(interaction, devModeEmbed.description);
        }

        async function interval() {
            const milliseconds = interaction.options.getInteger(
                'milliseconds',
                true,
            );

            client.config.interval = milliseconds;

            await Database.query(
                'UPDATE config SET "interval" = $1 WHERE index = 0',
                [client.config.interval],
            );

            const intervalEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsConfigIntervalTitle'))
                .setDescription(
                    i18n.getMessage('commandsConfigIntervalDescription', [
                        milliseconds,
                    ]),
                );

            payload.embeds = [intervalEmbed];

            Log.interaction(interaction, intervalEmbed.description);
        }

        async function restRequestTimeoutCommand() {
            const milliseconds = interaction.options.getInteger(
                'milliseconds',
                true,
            );

            client.config.restRequestTimeout = milliseconds;

            await Database.query(
                'UPDATE config SET "restRequestTimeout" = $1 WHERE index = 0',
                [client.config.restRequestTimeout],
            );

            const keyPercentageEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsConfigRestRequestTimeoutTitle'))
                .setDescription(
                    i18n.getMessage('commandsConfigRestRequestTimeoutDescription', [
                        milliseconds,
                    ]),
                );

            payload.embeds = [keyPercentageEmbed];

            Log.interaction(interaction, keyPercentageEmbed.description);
        }

        async function retryLimitCommand() {
            const limit = interaction.options.getInteger(
                'limit',
                true,
            );

            client.config.retryLimit = limit;

            await Database.query(
                'UPDATE config SET "retryLimit" = $1 WHERE index = 0',
                [client.config.retryLimit],
            );

            const keyPercentageEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsConfigRetryLimitTitle'))
                .setDescription(
                    i18n.getMessage('commandsConfigRetryLimitDescription', [limit]),
                );

            payload.embeds = [keyPercentageEmbed];

            Log.interaction(interaction, keyPercentageEmbed.description);
        }

        function viewCommand() {
            const viewEmbed = new BetterEmbed(interaction)
                .setColor(constants.colors.normal)
                .setTitle(i18n.getMessage('commandsConfigViewTitle'))
                .setDescription(
                    i18n.getMessage('commandsConfigViewDescription', [
                        client.config.core === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                        client.config.devMode === true
                            ? i18n.getMessage('on')
                            : i18n.getMessage('off'),
                        client.config.interval,
                        client.config.restRequestTimeout,
                        client.config.retryLimit,
                    ]),
                );

            payload.embeds = [viewEmbed];
        }

        await interaction.editReply(payload);
    }
}