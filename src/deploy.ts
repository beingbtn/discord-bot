import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import process from 'node:process';
import { i18n } from './locales/i18n';

(async () => {
    try {
        await new REST({ version: '10' })
            .setToken(process.env.DISCORD_TOKEN!)
            .put(Routes.applicationCommands(process.env.CLIENT_ID!), {
                body: [],
            });

        await new REST({ version: '10' })
            .setToken(process.env.DISCORD_TOKEN!)
            .put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID!,
                    '873000534955667496',
                ), {
                    body: [],
                },
            );

        console.log(new i18n().getMessage('commandsDeployTitle'));
    } catch (error) {
        console.error(error);
    }
})();