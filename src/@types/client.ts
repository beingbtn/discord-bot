/* eslint-disable no-unused-vars */
import type {
    ChatInputApplicationCommandData,
    Collection,
    CommandInteraction,
} from 'discord.js';
import type { Core } from '../core/core';
import { i18n } from '../locales/i18n';

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

export interface ClientEvent {
    properties: {
        name: string,
        once: boolean
    },
    execute(...parameters: unknown[]): Promise<void> | void,
}

export interface Config {
    core: boolean,
    devMode: boolean,
    interval: number,
    restRequestTimeout: number,
    retryLimit: number,
}

export interface WebhookConfig {
    id: string,
    token: string,
}

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, ClientCommand>,
        config: Config,
        cooldowns: Collection<string, Collection<string, number>>,
        core: Core,
        customPresence: PresenceData | null,
        events: Collection<string, ClientEvent>,
    }

    interface Interaction {
        i18n: i18n,
    }
}