import { ActivityTypes } from 'discord.js/typings/enums';
import {
    type ColorResolvable,
    type PresenceData,
} from 'discord.js';
import { locales } from '../locales/locales/main';
import { PresenceUpdateStatus } from 'discord-api-types/v10';
import { Time } from '../enums/Time';

export class Options {
    static colorsError: ColorResolvable = 0xAA0000;
    static colorsWarning: ColorResolvable = 0xFF5555;
    static colorsNormal: ColorResolvable = 0x2f3136;
    static colorsOk: ColorResolvable = 0xFFAA00;
    static colorsOn: ColorResolvable = 0x00AA00;

    static cooldownMinimum = Time.Second * 2.5;

    static coreDisabledTimeout = Time.Second * 2.5;
    static coreDispatchTimeout = Time.Second * 2.5;

    static defaultLocale: keyof typeof locales = 'en-US';
    static performanceHistory = 50;

    static pingOkMinimum = 300;
    static pingOnMinimum = 150;

    static postgresqlIdleTimeoutMillis = Time.Minute * 5;
    static presence: PresenceData = {
        activities: [{
            name: 'Hypixel News',
            type: ActivityTypes.WATCHING,
        }],
        status: PresenceUpdateStatus.Online,
    };

    static restRequestTimeout = Time.Second * 5;
    static retryLimit = 2;

    static timeoutBaseTimeout = Time.Minute;
    static timeoutMaxTimeout = Time.Day / 2;
}