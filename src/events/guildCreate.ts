import type { Guild } from 'discord.js';
import type { EventStatic } from '../@types/Event';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Log } from '../utility/Log';
import { setPresence } from '../utility/utility';


export default class implements EventStatic {
    static event = 'guildCreate';
    static once = false;

    static execute(guild: Guild) {
        if (
            guild.available === false ||
            !guild.client.isReady()
        ) {
            return;
        }

        Log.log(guild.client.i18n.getMessage('eventsGuildCreate', [
            guild.name,
            guild.id,
            guild.ownerId,
            guild.memberCount,
        ]));

        try {
            setPresence(guild.client);
        } catch (error) {
            new ErrorHandler(error).init();
        }
    }
}