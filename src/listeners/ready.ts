import type { Client } from 'discord.js';
import { Constants } from '../utility/Constants';
import { ErrorHandler } from '../errors/ErrorHandler';
import {
    Events,
    Listener,
} from '@sapphire/framework';
import { setPresence } from '../utility/utility';

export class ReadyListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: Events.ClientReady,
        });
    }

    public async run(client: Client) {
        this.container.logger.info(`Logged in as ${client?.user?.tag}!`);

        set();

        setInterval(set, Constants.msHour);

        function set() {
            try {
                setPresence();
            } catch (error) {
                new ErrorHandler(error).init();
            }
        }

        await this.container.core.init();
    }
}