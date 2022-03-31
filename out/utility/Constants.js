"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
exports.Constants = {
    colors: {
        hypixel: 0xDCAF4E,
        error: 0xAA0000,
        warning: 0xFF5555,
        normal: 0x2f3136,
        ok: 0xFFAA00,
        on: 0x00AA00,
        off: 0x555555,
    },
    defaults: {
        config: {
            core: true,
            devMode: false,
            interval: 60000,
        },
        language: 'en-US',
        performance: {
            start: 0,
            uses: 0,
            total: 0,
            fetch: 0,
            parse: 0,
            check: 0,
            send: 0,
        },
        presence: {
            activities: [{
                    name: 'Hypixel Announcements | {{ servers }} servers',
                    type: 'WATCHING',
                }],
            status: 'online',
        },
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
        day: 86400000,
        hour: 3600000,
        minute: 60000,
        second: 1000,
    },
    urls: {
        rss: [
            'https://hypixel.net/forums/news-and-announcements.4/-/index.rss',
            'https://hypixel.net/forums/skyblock-patch-notes.158/-/index.rss',
            'https://hypixel.net/forums/moderation-information-and-changes.164/-/index.rss',
            'https://hypixel.net/forums/official-hypixel-minecraft-server/-/index.rss',
        ],
    },
};
