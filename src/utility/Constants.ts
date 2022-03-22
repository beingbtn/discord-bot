import {
    ColorResolvable,
    PresenceData,
} from 'discord.js';

export const Constants = {
    colors: {
        error: 0xAA0000 as ColorResolvable,
        warning: 0xFF5555 as ColorResolvable,
        normal: 0x2f3136 as ColorResolvable, //#7289DA
        ok: 0xFFAA00 as ColorResolvable,
        on: 0x00AA00 as ColorResolvable,
        off: 0x555555 as ColorResolvable,
    },
    defaults: {
        config: {
            core: true,
            devMode: false,
        },
        language: 'en-US',
        presence: {
            activities: [{
                name: 'Hypixel Announcements | {{ servers }} servers',
                type: 'WATCHING',
            }],
            status: 'online',
        } as PresenceData,
        request: {
            restRequestTimeout: 5000,
            retryLimit: 2,
        },
    },
    limits: {
        embedDescription: 4096,
        embedField: 1024,
        performanceHistory: 50,
        userAPIDataHistory: 1000,
    },
    ms: {
        day: 86_400_000,
        hour: 3_600_000,
        minute: 60_000,
        second: 1_000,
    },
    urls: {
        rss: 'https://hypixel.net/forums/news-and-announcements.4/-/index.rss',
    },
};