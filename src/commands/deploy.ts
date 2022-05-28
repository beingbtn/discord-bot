import type { CommandInteraction } from 'discord.js';
import type { Command, CommandStatic } from '../@types/Command';
import { BetterEmbed } from '../utility/BetterEmbed';
import { Constants } from '../utility/constants1';
import { Log } from '../utility/Log';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'node:fs/promises';
import process from 'node:process';

export default class implements CommandStatic {
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
    };

    static async execute(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const commandFiles = await fs.readdir(__dirname);

        const userCommands: object[] = [];
        const ownerCommands: object[] = [];

        for (const commandFile of commandFiles) {
            const file = await import(`${__dirname}/${commandFile}`); // eslint-disable-line no-await-in-loop

            const command: Command = file.default;

            if (command.ownerOnly === false) {
                userCommands.push(command.structure);
            } else {
                ownerCommands.push(command.structure);
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
            .setColor(Constants.colors.normal)
            .setTitle(i18n.getMessage('commandsDeployTitle'))
            .setDescription(
                JSON.stringify(commands).slice(
                    0,
                    Constants.limits.embedDescription,
                ) ?? i18n.getMessage('commandsDeployNone'),
            );

        Log.interaction(
            interaction,
            `Scope: ${scope} | Type: ${type} | Guild ID: ${guildID}`,
        );

        await interaction.editReply({ embeds: [successEmbed] });
    }
}