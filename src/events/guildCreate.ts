import type { ClientEvent } from '../@types/client';
import type { Guild } from 'discord.js';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Log } from '../utility/Log';
import { setPresence } from '../utility/utility';

export const properties: ClientEvent['properties'] = {
    name: 'guildCreate',
    once: false,
};

export const execute: ClientEvent['execute'] = async (guild: Guild): Promise<void> => {
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
        await ErrorHandler.init(error);
    }
};