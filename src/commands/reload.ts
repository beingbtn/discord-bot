import type {
    ClientEvent,
    ClientCommand,
} from '../@types/client';
import { BetterEmbed } from '../utility/utility';
import { CommandInteraction } from 'discord.js';
import { Constants } from '../utility/Constants';
import { Log } from '../utility/Log';

export const properties: ClientCommand['properties'] = {
    name: 'reload',
    description: 'Reloads all imports or a single import.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'reload',
        description: 'Reload',
        options: [
            {
                name: 'all',
                type: 1,
                description: 'Refreshes all imports',
            },
            {
                name: 'single',
                type: 1,
                description: 'Refresh a single command',
                options: [
                    {
                        name: 'type',
                        type: 3,
                        description: 'The category to refresh',
                        required: true,
                        choices: [
                            {
                                name: 'commands',
                                value: 'commands',
                            },
                            {
                                name: 'events',
                                value: 'events',
                            },
                            {
                                name: 'modules',
                                value: 'modules',
                            },
                        ],
                    },
                    {
                        name: 'item',
                        type: 3,
                        description: 'The item to refresh',
                        required: true,
                    },
                ],
            },
        ],
    },
};

//Determines if the runtime is using .js or ts-node
let extension: string;

try {
    require('../main.js');
    extension = '.js';
} catch {
    extension = '.ts';
}

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const { i18n } = interaction;

    switch (interaction.options.getSubcommand()) {
        case 'all': await reloadAll();
        break;
        case 'single': await reloadSingle();
        break;
        //no default
    }

    async function reloadAll() {
        const now = Date.now();
        const promises: Promise<void>[] = [];

        for (const [command] of interaction.client.commands) {
            promises.push(commandRefresh(interaction, command));
        }

        for (const [event] of interaction.client.events) {
            promises.push(eventRefresh(interaction, event));
        }

        await Promise.all(promises);

        const reloadedEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(i18n.getMessage('commandsReloadAllTitle'))
            .setDescription(i18n.getMessage('commandsReloadAllDescription', [
                promises.length,
                Date.now() - now,
            ]));

        Log.interaction(interaction, `All imports have been reloaded after ${
            Date.now() - now
        } milliseconds.`);

        await interaction.editReply({ embeds: [reloadedEmbed] });
    }

    async function reloadSingle() {
        const now = Date.now();
        const typeName = interaction.options.getString('type', true);
        const type =
            interaction.client[
                typeName as keyof Pick<
                    typeof interaction.client,
                    'commands' | 'events'
                >
            ];
        const item = interaction.options.getString('item')!;
        const selected = type.get(item);

        if (typeof selected === 'undefined') {
            const undefinedSelected = new BetterEmbed(interaction)
                .setColor(Constants.colors.warning)
                .setTitle(i18n.getMessage('commandsReloadSingleUnknownTitle'))
                .setDescription(
                    i18n.getMessage('commandsReloadSingleUnknownDescription', [
                        typeName,
                        item,
                    ],
                ));

            await interaction.editReply({ embeds: [undefinedSelected] });
            return;
        }

        if (typeName === 'commands') {
            commandRefresh(interaction, selected.properties.name);
        } else if (typeName === 'events') {
            eventRefresh(interaction, selected.properties.name);
        }

        const reloadedEmbed = new BetterEmbed(interaction)
            .setColor(Constants.colors.normal)
            .setTitle(i18n.getMessage('commandsReloadSingleSuccessTitle'))
            .setDescription(
                i18n.getMessage('commandsReloadSingleSuccessDescription', [
                    typeName,
                    item,
                    Date.now() - now,
                ],
            ));

        Log.interaction(interaction, `${typeName}.${item} was successfully reloaded after ${
            Date.now() - now
        } milliseconds.`);

        await interaction.editReply({ embeds: [reloadedEmbed] });
    }
};


async function commandRefresh(interaction: CommandInteraction, item: string) {
    const refreshed = await reload<ClientCommand>(`${item}`);
    interaction.client.commands.set(refreshed.properties.name, refreshed);
}

async function eventRefresh(interaction: CommandInteraction, item: string) {
    const refreshed = await reload<ClientEvent>(`../events/${item}`);
    interaction.client.events.set(refreshed.properties.name, refreshed);
}

function reload<Type>(path: string) {
    return new Promise<Type>(resolve => {
        delete require.cache[require.resolve(`${__dirname}/${path}${extension}`)];
        const refreshed: Type = require(`${__dirname}/${path}${extension}`); //eslint-disable-line @typescript-eslint/no-var-requires
        resolve(refreshed);
    });
}