"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const utility_1 = require("../utility/utility");
const Constants_1 = require("../utility/Constants");
const RegionLocales_1 = require("../locales/RegionLocales");
exports.properties = {
    name: 'presence',
    description: 'Set a custom presence.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'presence',
        description: 'Set a custom presence for the bot',
        options: [
            {
                name: 'clear',
                type: 1,
                description: 'Clear the custom presence',
            },
            {
                name: 'set',
                description: 'Set a custom presence',
                type: 1,
                options: [
                    {
                        name: 'status',
                        type: 3,
                        description: 'The status to use',
                        required: true,
                        choices: [
                            {
                                name: 'Online',
                                value: 'online',
                            },
                            {
                                name: 'Idle',
                                value: 'idle',
                            },
                            {
                                name: 'Invisible',
                                value: 'invisible',
                            },
                            {
                                name: 'Do Not Disturb ',
                                value: 'dnd ',
                            },
                        ],
                    },
                    {
                        name: 'type',
                        type: 3,
                        description: 'The type to display',
                        required: true,
                        choices: [
                            {
                                name: 'Playing',
                                value: 'PLAYING',
                            },
                            {
                                name: 'Streaming',
                                value: 'STREAMING',
                            },
                            {
                                name: 'Listening',
                                value: 'LISTENING',
                            },
                            {
                                name: 'Watching',
                                value: 'WATCHING',
                            },
                            {
                                name: 'Competing',
                                value: 'COMPETING',
                            },
                        ],
                    },
                    {
                        name: 'name',
                        type: 3,
                        description: 'The message/name to display',
                        required: true,
                    },
                    {
                        name: 'url',
                        type: 3,
                        description: 'The url to stream at',
                        required: false,
                    },
                ],
            },
        ],
    },
};
const execute = async (interaction) => {
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.presence;
    const { replace } = RegionLocales_1.RegionLocales;
    const responseEmbed = new utility_1.BetterEmbed(interaction)
        .setColor(Constants_1.Constants.colors.normal);
    if (interaction.options.getSubcommand() === 'set') {
        const type = interaction.options.getString('type', true);
        const name = interaction.options.getString('name', true);
        const url = interaction.options.getString('url', false);
        const status = interaction.options.getString('status', true);
        interaction.client.customPresence = {
            activities: [{
                    type: type,
                    name: name,
                    url: url ?? undefined,
                }],
            status: status,
        };
        responseEmbed
            .setTitle(text.set.title)
            .addFields([
            {
                name: text.set.status.name,
                value: replace(text.set.status.value, {
                    status: status,
                }),
            },
            {
                name: text.set.type.name,
                value: replace(text.set.type.value, {
                    type: type,
                }),
            },
            {
                name: text.set.name.name,
                value: replace(text.set.name.value, {
                    name: name,
                }),
            },
            {
                name: text.set.url.name,
                value: replace(text.set.url.value, {
                    url: url ?? text.set.none,
                }),
            },
        ]);
    }
    else {
        responseEmbed
            .setTitle(text.cleared.title)
            .setDescription(text.cleared.description);
        interaction.client.customPresence = null;
    }
    (0, utility_1.setPresence)(interaction.client);
    await interaction.editReply({ embeds: [responseEmbed] });
};
exports.execute = execute;
