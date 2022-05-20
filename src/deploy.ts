import 'dotenv/config';
import type { ClientCommand } from './@types/client';
import { i18n } from './locales/i18n';
import { Log } from './utility/Log';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import process from 'node:process';

(async () => {
    //Determines if the runtime is using .js or ts-node
    let extension: string;

    try {
        require('./main.js');
        extension = '.js';
    } catch {
        extension = '.ts';
    }

    try {
        const deployCommand = (
            (await import(`${__dirname}/commands/deploy${extension}`)) as ClientCommand
        ).properties.structure;

        await new REST({ version: '9' })
            .setToken(process.env.DISCORD_TOKEN!)
            .put(Routes.applicationCommands(process.env.CLIENT_ID!), {
                body: [deployCommand],
            });

        Log.log(new i18n().getMessage('commandsDeployTitle'));
    } catch (error) {
        Log.error(error);
    }
})();