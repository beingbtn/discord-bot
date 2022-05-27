import { ClientEvents } from 'discord.js';

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */

//Static typings
export class EventStatic {
    static event: keyof ClientEvents;
    static once: boolean;
    static execute(...parameters: unknown[]): Promise<void> | void { }
}

//Main typings
export interface EventType {
    event: keyof ClientEvents;
    once: boolean;
    execute(...parameters: unknown[]): Promise<void> | void;
}