import type { Collection } from 'discord.js';
import type { Command } from './Command';
import type { Config } from './Config';
import type { Core } from '../core/Core';
import type { Event } from './Event';
import type { i18n } from '../locales/i18n';

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>,
        config: Config,
        cooldowns: Collection<string, Collection<string, number>>,
        core: Core,
        customPresence: PresenceData | null,
        events: Collection<string, Event>,
        i18n: i18n,
    }

    interface Interaction {
        i18n: i18n,
    }
}