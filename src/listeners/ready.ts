import type { Client } from 'discord.js';
import { ErrorHandler } from '../errors/ErrorHandler';
import {
    Events,
    Listener,
} from '@sapphire/framework';
import { setPresence } from '../utility/utility';
import { Time } from '../enums/Time';

export class ReadyListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: Events.ClientReady,
        });
    }

    public async run(client: Client) {
        this.container.logger.info(
            this.container.i18n.getMessage(
                'eventsReady', [
                client!.user!.tag!,
            ]),
        );

        set();

        setInterval(set, Time.Hour);

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