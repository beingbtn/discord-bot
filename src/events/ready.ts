import type { Client } from 'discord.js';
import type { ClientEvent } from '../@types/client';
import { Constants } from '../utility/Constants';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Log } from '../utility/Log';
import { setPresence } from '../utility/utility';

export const properties: ClientEvent['properties'] = {
    name: 'ready',
    once: true,
};

export const execute: ClientEvent['execute'] = async (client: Client) => {
    Log.log(`Logged in as ${client?.user?.tag}!`);

    await set();

    setInterval(set, Constants.ms.hour);

    async function set() {
        try {
            setPresence(client);
        } catch (error) {
            await ErrorHandler.init(error);
        }
    }

    await client.core.init();
};