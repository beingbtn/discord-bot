import type { Guild } from 'discord.js';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Listener } from '@sapphire/framework';
import { setPresence } from '../utility/utility';

export class RateLimitListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: 'guildCreate',
        });
    }

    public run(guild: Guild) {
        if (
            guild.available === false ||
            !guild.client.isReady()
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
            setPresence(guild.client);
        } catch (error) {
            new ErrorHandler(error).init();
        }
    }
}