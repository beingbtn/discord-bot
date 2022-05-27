import { ClientEvents } from 'discord.js';

/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

//Main typings
export interface Event {
    event: keyof ClientEvents;
    once: boolean;
    execute(...parameters: unknown[]): Promise<void> | void;
}

//Static typings
export class EventStatic {
    static event: keyof ClientEvents;
    static once: boolean;
    static execute(...parameters: unknown[]): Promise<void> | void { }
}