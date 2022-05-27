import type { Client } from 'discord.js';
import type { EventStatic } from '../@types/Event';
import { constants } from '../utility/constants';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Log } from '../utility/Log';
import { setPresence } from '../utility/utility';

export default class implements EventStatic {
    static event = 'ready';
    static once = true;

    static async execute(client: Client) {
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
    }
}