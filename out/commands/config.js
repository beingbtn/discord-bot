"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const utility_1 = require("../utility/utility");
const Constants_1 = require("../utility/Constants");
const Log_1 = require("../utility/Log");
const RegionLocales_1 = require("../locales/RegionLocales");
exports.properties = {
    name: 'config',
    description: 'Configure the bot.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'config',
        description: 'Toggles dynamic settings',
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
                        description: 'The timeout in milliseconds',
                        required: true,
                        minValue: 180000,
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
    },
};
const execute = async (interaction) => {
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.config;
    const replace = RegionLocales_1.RegionLocales.replace;
    const payload = {};
    const client = interaction.client;
    switch (interaction.options.getSubcommand()) {
        case 'core':
            coreCommand();
            break;
        case 'devmode':
            devModeCommand();
            break;
        case 'interval':
            interval();
            break;
        case 'restrequesttimeout':
            restRequestTimeoutCommand();
            break;
        case 'retrylimit':
            retryLimitCommand();
            break;
        case 'view':
            viewCommand();
            break;
        //no default
    }
    function coreCommand() {
        client.config.core = !client.config.core;
        const coreEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.core.title)
            .setDescription(replace(text.core.description, {
            state: client.config.core === true
                ? text.on
                : text.off,
        }));
        payload.embeds = [coreEmbed];
        Log_1.Log.interaction(interaction, coreEmbed.description);
    }
    function devModeCommand() {
        client.config.devMode = !client.config.devMode;
        const devModeEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.devMode.title)
            .setDescription(replace(text.devMode.description, {
            state: client.config.devMode === true
                ? text.on
                : text.off,
        }));
        payload.embeds = [devModeEmbed];
        Log_1.Log.interaction(interaction, devModeEmbed.description);
    }
    function interval() {
        const milliseconds = interaction.options.getInteger('interval', true);
        client.config.interval = milliseconds;
        const intervalEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.retryLimit.title)
            .setDescription(replace(text.retryLimit.description, {
            interval: milliseconds,
        }));
        payload.embeds = [intervalEmbed];
        Log_1.Log.interaction(interaction, intervalEmbed.description);
    }
    function restRequestTimeoutCommand() {
        const milliseconds = interaction.options.getInteger('milliseconds', true);
        client.config.restRequestTimeout = milliseconds;
        const keyPercentageEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.restRequestTimeout.title)
            .setDescription(replace(text.restRequestTimeout.description, {
            milliseconds: milliseconds,
        }));
        payload.embeds = [keyPercentageEmbed];
        Log_1.Log.interaction(interaction, keyPercentageEmbed.description);
    }
    function retryLimitCommand() {
        const limit = interaction.options.getInteger('limit', true);
        client.config.retryLimit = limit;
        const keyPercentageEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.retryLimit.title)
            .setDescription(replace(text.retryLimit.description, {
            limit: limit,
        }));
        payload.embeds = [keyPercentageEmbed];
        Log_1.Log.interaction(interaction, keyPercentageEmbed.description);
    }
    function viewCommand() {
        const viewEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.view.title)
            .setDescription(replace(text.view.description, {
            core: client.config.core === true ? text.on : text.off,
            devMode: client.config.devMode === true ? text.on : text.off,
            interval: client.config.interval,
            restRequestTimeout: client.config.restRequestTimeout,
            retryLimit: client.config.retryLimit,
        }));
        payload.embeds = [viewEmbed];
    }
    await interaction.editReply(payload);
};
exports.execute = execute;
