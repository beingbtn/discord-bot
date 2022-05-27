import type {
    ChatInputApplicationCommandData,
    CommandInteraction,
} from 'discord.js';

/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

//Main typings
export interface Command {
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
    execute(interaction: CommandInteraction): Promise<void>;
}

//Static typings
export class CommandStatic {
    static cooldown: number;
    static ephemeral: boolean;
    static noDM: boolean;
    static ownerOnly: boolean;
    static permissions: {
        bot: {
            global: bigint[],
            local: bigint[],
        },
        user: {
            global: bigint[],
            local: bigint[],
        },
    };
    static structure: ChatInputApplicationCommandData;
    static async execute(interaction: CommandInteraction): Promise<void> { }
}