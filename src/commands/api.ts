import type { ClientCommand } from '../@types/main';
import { BetterEmbed } from '../utility/BetterEmbed';
import { cleanLength } from '../utility/utility';
import { constants } from '../utility/constants';
import { Log } from '../utility/Log';

export const properties: ClientCommand['properties'] = {
    name: 'api',
    description: 'Configure the bot.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    permissions: {
        bot: {
            global: [],
            local: [],
        },
        user: {
            global: [],
            local: [],
        },
    },
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

type errorTypes = 'abort' | 'generic' | 'http';

type TimeoutSettables = 'timeout' | 'resumeAfter';

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const { i18n } = interaction;

    switch (interaction.options.getSubcommand()) {
        case 'stats': await stats();
        break;
        case 'set': await set();
        break;
        case 'call': await call();
        break;
        //no default
    }

    async function stats() {
        const { abort, generic, http, getTimeout } =
            interaction.client.core.errors;
        const { uses } =
            interaction.client.core;

        const statsEmbed = new BetterEmbed(interaction)
            .setColor(constants.colors.normal)
            .setDescription(
                JSON.stringify(
                    interaction.client.core.performance,
                ).slice(0, constants.limits.embedDescription),
            )
            .addFields(
                {
                    name: i18n.getMessage('commandsAPIStatsEnabledName'),
                    value: i18n.getMessage(
                        interaction.client.config.core === true
                            ? 'yes'
                            : 'no',
                    ),
                },
                {
                    name: i18n.getMessage('commandsAPIStatsResumeName'),
                    value: getTimeout()
                        ? cleanLength(getTimeout())!
                        : i18n.getMessage('null'),
                },
                {
                    name: i18n.getMessage('commandsAPIStatsLastHourName'),
                    value: i18n.getMessage('commandsAPIStatsLastHourValue', [
                        abort.lastHour,
                        generic.lastHour,
                        http.lastHour,
                    ]),
                },
                {
                    name: i18n.getMessage('commandsAPIStatsNextTimeoutsName'),
                    value: i18n.getMessage('commandsAPIStatsNextTimeoutsValue', [
                        cleanLength(abort.timeout) ?? i18n.getMessage('null'),
                        cleanLength(generic.timeout) ?? i18n.getMessage('null'),
                        cleanLength(http.timeout) ?? i18n.getMessage('null'),
                    ]),
                },
                {
                    name: i18n.getMessage('commandsAPIStatsUsesName'),
                    value: String(uses),
                },
            );

        await interaction.editReply({
            embeds: [statsEmbed],
        });
    }

    async function set() {
        const category = interaction.options.getString('category', true) as errorTypes;
        const type = interaction.options.getString('type', true);
        const value = interaction.options.getNumber('value', true);

        interaction.client.core.errors[category][
            type as TimeoutSettables
        ] = value;
        const setEmbed = new BetterEmbed(interaction)
            .setColor(constants.colors.normal)
            .setTitle(i18n.getMessage('commandsAPISetTitle'))
            .setDescription(i18n.getMessage('commandsAPISetDescription', [
                category,
                type,
                value,
            ]));

        Log.interaction(interaction, setEmbed.description);

        await interaction.editReply({
            embeds: [setEmbed],
        });
    }

    async function call() {
        const method = interaction.options.getString('method', true);

        const hypixelModuleErrors = interaction.client.core.errors;

        if (
            method === 'addAbort' ||
            method === 'addGeneric' ||
            method === 'addHTTP'
        ) {
            hypixelModuleErrors[method]();
        }

        const callEmbed = new BetterEmbed(interaction)
            .setColor(constants.colors.normal)
            .setTitle(i18n.getMessage('commandsAPICallTitle'))
            .setDescription(i18n.getMessage('commandsAPICallDescription', [
                method,
            ]));

        Log.interaction(interaction, callEmbed.description);

        await stats();
        await interaction.followUp({
            embeds: [callEmbed],
            ephemeral: true,
        });
    }
};