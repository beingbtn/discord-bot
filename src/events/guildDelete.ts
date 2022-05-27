import type { EventStatic } from '../@types/Event';
import type { Guild } from 'discord.js';
import { ErrorHandler } from '../errors/ErrorHandler';
import {
    formattedUnix,
    setPresence,
} from '../utility/utility';
import { Log } from '../utility/Log';

export default class implements EventStatic {
    static event = 'guildDelete';
    static once = false;

    static execute(guild: Guild) {
        if (
            guild.available === false ||
            !guild.client.isReady()
        ) {
            return;
        }

        const joinedAt = formattedUnix({
            ms: guild.joinedTimestamp,
            date: true,
            utc: true,
        })!;

        Log.log(guild.client.i18n.getMessage('eventsGuildDelete', [
            joinedAt,
            guild.name,
            guild.id,
            guild.ownerId,
            guild.memberCount - 1,
        ]));

        try {
            setPresence(guild.client);
        } catch (error) {
            new ErrorHandler(error).init();
        }
    }
}