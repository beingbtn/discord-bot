"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const utility_1 = require("../utility/utility");
const Constants_1 = require("../utility/Constants");
const Log_1 = require("../utility/Log");
const RegionLocales_1 = require("../locales/RegionLocales");
exports.properties = {
    name: 'api',
    description: 'Configure the bot.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'api',
        description: 'Toggles dynamic settings',
        options: [
            {
                name: 'stats',
                type: 1,
                description: 'Returns some stats about the API Request Handler',
            },
            {
                name: 'set',
                type: 1,
                description: 'Set data for the API Request Handler',
                options: [
                    {
                        name: 'category',
                        type: 3,
                        description: 'The category to execute on',
                        required: true,
                        choices: [
                            {
                                name: 'abort',
                                value: 'abort',
                            },
                            {
                                name: 'generic',
                                value: 'generic',
                            },
                            {
                                name: 'http',
                                value: 'http',
                            },
                        ],
                    },
                    {
                        name: 'type',
                        type: 3,
                        description: 'The category to execute on',
                        required: true,
                        choices: [
                            {
                                name: 'pauseFor',
                                value: 'pauseFor',
                            },
                            {
                                name: 'resumeAfter',
                                value: 'resumeAfter',
                            },
                            {
                                name: 'timeout',
                                value: 'timeout',
                            },
                        ],
                    },
                    {
                        name: 'value',
                        type: 10,
                        description: 'An integer as an input',
                        required: true,
                        min_value: 0,
                    },
                ],
            },
            {
                name: 'call',
                type: 1,
                description: 'Call a function from the API Request Handler',
                options: [
                    {
                        name: 'method',
                        type: 3,
                        description: 'The method to call',
                        required: true,
                        choices: [
                            {
                                name: 'addAbort()',
                                value: 'addAbort',
                            },
                            {
                                name: 'addGeneric()',
                                value: 'addGeneric',
                            },
                            {
                                name: 'addHTTP()',
                                value: 'addHTTP',
                            },
                        ],
                    },
                ],
            },
        ],
    },
};
const execute = async (interaction) => {
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.api;
    const { replace } = RegionLocales_1.RegionLocales;
    switch (interaction.options.getSubcommand()) {
        case 'stats':
            await stats();
            break;
        case 'set':
            await set();
            break;
        case 'call':
            await call();
            break;
        //no default
    }
    async function stats() {
        const { abort, generic, http, getTimeout } = interaction.client.core.error;
        const { uses } = interaction.client.core;
        const statsEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setDescription(JSON.stringify(interaction.client.core.performance).slice(0, Constants_1.Constants.limits.embedDescription))
            .addFields({
            name: text.api.enabled.name,
            value: replace(text.api.enabled.value, {
                state: interaction.client.config.core === true
                    ? text.api.yes
                    : text.api.no,
            }),
        }, {
            name: text.api.resume.name,
            value: replace(text.api.resume.value, {
                time: (0, utility_1.cleanLength)(getTimeout() - Date.now()) ??
                    'Not applicable',
            }),
        }, {
            name: text.api.lastMinute.name,
            value: replace(text.api.lastMinute.value, {
                abort: abort.lastMinute,
                generic: generic.lastMinute,
                http: http.lastMinute,
            }),
        }, {
            name: text.api.nextTimeouts.name,
            value: replace(text.api.nextTimeouts.value, {
                abort: (0, utility_1.cleanLength)(abort.timeout),
                generic: (0, utility_1.cleanLength)(generic.timeout),
                http: (0, utility_1.cleanLength)(http.timeout),
            }),
        }, {
            name: text.api.apiKey.name,
            value: replace(text.api.apiKey.value, {
                uses: uses,
            }),
        });
        await interaction.editReply({
            embeds: [statsEmbed],
        });
    }
    async function set() {
        const category = interaction.options.getString('category', true);
        const type = interaction.options.getString('type', true);
        const value = interaction.options.getNumber('value', true);
        interaction.client.core.error[category][type] = value;
        const setEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.set.title)
            .setDescription(replace(text.set.description, {
            category: category,
            type: type,
            value: value,
        }));
        Log_1.Log.interaction(interaction, setEmbed.description);
        await interaction.editReply({
            embeds: [setEmbed],
        });
    }
    async function call() {
        const method = interaction.options.getString('method', true);
        const hypixelModuleErrors = interaction.client.core.error;
        if (method === 'addAbort' ||
            method === 'addGeneric' ||
            method === 'addHTTP') {
            hypixelModuleErrors[method]();
        }
        const callEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.call.title)
            .setDescription(replace(text.call.title, {
            method: method,
        }));
        Log_1.Log.interaction(interaction, callEmbed.description);
        await stats();
        await interaction.followUp({
            embeds: [callEmbed],
            ephemeral: true,
        });
    }
};
exports.execute = execute;
