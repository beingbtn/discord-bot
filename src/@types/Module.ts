import type {
    ChatInputApplicationCommandData,
    Collection,
    CommandInteraction,
} from 'discord.js';
import type { Config } from './Config';
import type { Core } from '../core/Core';
import type { Event } from './Event';
import type { i18n } from '../locales/i18n';

/* eslint-disable no-unused-vars */

export interface ClientCommand {
    properties: {
        name: string,
        description: string,
        cooldown: number,
        ephemeral: boolean,
        noDM: boolean,
        ownerOnly: boolean,
        permissions: {
            bot: {
                global: bigint[],
                local: bigint[],
            },
            user: {
                global: bigint[],
                local: bigint[],
            },
        },
        structure: ChatInputApplicationCommandData,
    },
    execute: {
        (interaction: CommandInteraction): Promise<void>,
    },
}

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, ClientCommand>,
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