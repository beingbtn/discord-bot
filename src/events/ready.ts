import type { Client } from 'discord.js';
import type { ClientEvent } from '../@types/client';
import { constants } from '../utility/constants';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Log } from '../utility/Log';
import { setPresence } from '../utility/utility';

export const properties: ClientEvent['properties'] = {
    name: 'ready',
    once: true,
};

export const execute: ClientEvent['execute'] = async (client: Client) => {
    Log.log(`Logged in as ${client?.user?.tag}!`);

    set();

    setInterval(set, constants.ms.hour);

    function set() {
        try {
            setPresence(client);
        } catch (error) {
            new ErrorHandler(error).init();
        }
    }

    await client.core.init();
};