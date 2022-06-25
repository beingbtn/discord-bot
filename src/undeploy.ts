import 'dotenv/config';
import process from 'node:process';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { i18n } from './locales/i18n';

(async () => {
    try {
        const rest = new REST({ version: '10' })
            .setToken(process.env.DISCORD_TOKEN!);

        const guildIDs = JSON.parse(process.env.OWNER_GUILDS!) as string[];

        await Promise.all([
            rest.put(
                Routes.applicationCommands(
                    process.env.CLIENT_ID!,
                ), {
                    body: [],
                },
            ),
            ...guildIDs.map((guildID) => rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID!,
                    guildID,
                ), {
                    body: [],
                },
            )),
        ]);

        console.log(new i18n().getMessage('commandsDeployTitle'));
    } catch (error) {
        console.error(error);
    }
})();