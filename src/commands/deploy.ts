import type { ClientCommand } from '../@types/Module';
import { BetterEmbed } from '../utility/BetterEmbed';
import { constants } from '../utility/constants';
import { Log } from '../utility/Log';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'node:fs/promises';
import process from 'node:process';

export const properties: ClientCommand['properties'] = {
    name: 'deploy',
    description: 'Deploy commands.',
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
        name: 'deploy',
        description: 'Deploy commands',
        options: [
            {
                name: 'scope',
                description: 'Global or Guild',
                type: 3,
                required: true,
                choices: [
                    {
                        name: 'Global',
                        value: 'global',
                    },
                    {
                        name: 'Guild',
                        value: 'guild',
                    },
                ],
            },
            {
                name: 'type',
                description: 'User or Owner commands',
                type: 3,
                required: true,
                choices: [
                    {
                        name: 'User',
                        value: 'user',
                    },
                    {
                        name: 'Owner',
                        value: 'owner',
                    },
                    {
                        name: 'Both',
                        value: 'both',
                    },
                    {
                        name: 'None',
                        value: 'none',
                    },
                ],
            },
            {
                name: 'guild',
                description: 'Guild ID',
                type: 3,
                required: false,
            },
        ],
    },
};

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const { i18n } = interaction;

    const commandFiles = await fs.readdir(__dirname);

    const userCommands: object[] = [];
    const ownerCommands: object[] = [];

    for (const file of commandFiles) {
        const {
            properties: { ownerOnly, structure },
        }: ClientCommand = await import(`${__dirname}/${file}`); // eslint-disable-line no-await-in-loop

        if (ownerOnly === false) {
            userCommands.push(structure);
        } else {
            ownerCommands.push(structure);
        }
    }

    const scope = interaction.options.getString('scope', true);
    const type = interaction.options.getString('type', true);
    const guildID =
        interaction.options.getString('guild') ?? interaction.guildId!;

    const commands =
        type === 'both'
            ? ownerCommands.concat(userCommands)
            : type === 'none'
            ? []
            : type === 'owner'
            ? ownerCommands
            : userCommands;

    const token = process.env.DISCORD_TOKEN!;
    const rest = new REST({ version: '9' }).setToken(token);
    const clientID = process.env.CLIENT_ID!;

    if (scope === 'global') {
        await rest.put(Routes.applicationCommands(clientID), {
            body: commands,
        });
    } else {
        await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
            body: commands,
        });
    }

    const successEmbed = new BetterEmbed(interaction)
        .setColor(constants.colors.normal)
        .setTitle(i18n.getMessage('commandsDeployTitle'))
        .setDescription(
            JSON.stringify(commands).slice(
                0,
                constants.limits.embedDescription,
            ) ?? i18n.getMessage('commandsDeployNone'),
        );

    Log.interaction(
        interaction,
        `Scope: ${scope} | Type: ${type} | Guild ID: ${guildID}`,
    );

    await interaction.editReply({ embeds: [successEmbed] });
};