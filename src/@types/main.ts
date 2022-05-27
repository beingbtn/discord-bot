/* eslint-disable no-unused-vars */
import type {
    ChatInputApplicationCommandData,
    Collection,
    CommandInteraction,
} from 'discord.js';
import type { Core } from '../core/Core';
import type { i18n } from '../locales/i18n';
import type { EventType } from './Event';

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

export interface Config {
    core: boolean,
    devMode: boolean,
    interval: number,
    restRequestTimeout: number,
    retryLimit: number,
}

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, ClientCommand>,
        config: Config,
        cooldowns: Collection<string, Collection<string, number>>,
        core: Core,
        customPresence: PresenceData | null,
        events: Collection<string, EventType>,
        i18n: i18n,
    }

    interface Interaction {
        i18n: i18n,
    }
}