import 'dotenv/config';
import type { ClientCommand } from './@types/client';
import { Log } from './utility/Log';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

(async () => {
    try {
        Log.log('Starting deployment of the deploy command.');

        const deployCommand = (
            (await import(`${__dirname}/commands/deploy.ts`)) as ClientCommand
        ).properties.structure;

        await new REST({ version: '9' })
            .setToken(process.env.discordAPIkey!)
            .put(Routes.applicationCommands(process.env.CLIENT_ID!), {
                body: [deployCommand],
            });

        Log.log('Successfully deployed the deploy command.');
    } catch (error) {
        Log.error(error);
    }
})();