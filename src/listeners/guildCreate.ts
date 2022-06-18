import { type Guild } from 'discord.js';
import { Listener } from '@sapphire/framework';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Events } from '../enums/Events';
import { setPresence } from '../utility/utility';

export class RateLimitListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.GuildCreate,
        });
    }

    public run(guild: Guild) {
        if (
            guild.available === false
            || !guild.client.isReady()
        ) {
            return;
        }

        this.container.logger.info(
            this.container.i18n.getMessage(
                'eventsGuildCreate', [
                    guild.name,
                    guild.id,
                    guild.ownerId,
                    guild.memberCount,
                ],
            ),
        );

        try {
            setPresence();
        } catch (error) {
            new ErrorHandler(error).init();
        }
    }
}