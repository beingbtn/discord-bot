import type { ClientCommand } from '../@types/client';
import { BetterEmbed } from '../utility/utility';
import { Constants } from '../utility/Constants';
import { Log } from '../utility/Log';
import { RegionLocales } from '../locales/RegionLocales';
import { WebhookEditMessageOptions } from 'discord.js';

export const properties: ClientCommand['properties'] = {
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

export const execute: ClientCommand['execute'] = async (
    interaction,
    locale,
): Promise<void> => {
    const text = RegionLocales.locale(locale).commands.config;
    const replace = RegionLocales.replace;

    const payload: WebhookEditMessageOptions = {};

    const client = interaction.client;

    switch (interaction.options.getSubcommand()) {
        case 'core': coreCommand();
        break;
        case 'devmode': devModeCommand();
        break;
        case 'restrequesttimeout': restRequestTimeoutCommand();
        break;
        case 'retrylimit': retryLimitCommand();
        break;
        case 'view': viewCommand();
        break;
        //no default
    }

    function coreCommand() {
        client.config.core = !client.config.core;

        const coreEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(text.core.title)
            .setDescription(replace(text.core.description, {
                state: client.config.core === true
                    ? text.on
                    : text.off,
            }));

        payload.embeds = [coreEmbed];

        Log.interaction(interaction, coreEmbed.description);
    }

    function devModeCommand() {
        client.config.devMode = !client.config.devMode;

        const devModeEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(text.devMode.title)
            .setDescription(replace(text.devMode.description, {
                state: client.config.devMode === true
                    ? text.on
                    : text.off,
            }));

        payload.embeds = [devModeEmbed];

        Log.interaction(interaction, devModeEmbed.description);
    }

    function restRequestTimeoutCommand() {
        const milliseconds = interaction.options.getInteger('milliseconds', true);
        client.config.restRequestTimeout = milliseconds;

        const keyPercentageEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(text.restRequestTimeout.title)
            .setDescription(replace(text.restRequestTimeout.description, {
                milliseconds: milliseconds,
            }));

        payload.embeds = [keyPercentageEmbed];

        Log.interaction(interaction, keyPercentageEmbed.description);
    }

    function retryLimitCommand() {
        const limit = interaction.options.getInteger('limit', true);
        client.config.retryLimit = limit;

        const keyPercentageEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(text.retryLimit.title)
            .setDescription(replace(text.retryLimit.description, {
                limit: limit,
            }));

        payload.embeds = [keyPercentageEmbed];

        Log.interaction(interaction, keyPercentageEmbed.description);
    }

    function viewCommand() {
        const viewEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(text.view.title)
            .setDescription(replace(text.view.description, {
                core: client.config.core === true ? text.on : text.off,
                devMode: client.config.devMode === true ? text.on : text.off,
                restRequestTimeout: client.config.restRequestTimeout,
                retryLimit: client.config.retryLimit,
            }));

        payload.embeds = [viewEmbed];
    }

    await interaction.editReply(payload);
};