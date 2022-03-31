"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const Constants_1 = require("./utility/Constants");
const core_1 = require("./core/core");
const database_1 = require("./utility/database");
const ErrorHandler_1 = require("./utility/errors/ErrorHandler");
const Log_1 = require("./utility/Log");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_process_1 = __importDefault(require("node:process"));
node_process_1.default.on('exit', code => {
    Log_1.Log.log(`Exiting with code ${code}`);
});
node_process_1.default.on('unhandledRejection', async (error) => {
    Log_1.Log.error('unhandledRejection');
    await ErrorHandler_1.ErrorHandler.init(error);
    node_process_1.default.exit(1);
});
node_process_1.default.on('uncaughtException', async (error) => {
    Log_1.Log.error('uncaughtException');
    await ErrorHandler_1.ErrorHandler.init(error);
    node_process_1.default.exit(1);
});
const client = new discord_js_1.Client({
    allowedMentions: {
        parse: ['users'],
        repliedUser: true,
    },
    failIfNotExists: false,
    intents: [discord_js_1.Intents.FLAGS.GUILDS],
    makeCache: discord_js_1.Options.cacheWithLimits({
        GuildBanManager: 0,
        GuildInviteManager: 0,
        GuildMemberManager: 25,
        GuildEmojiManager: 0,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        MessageManager: 50,
        PresenceManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        VoiceStateManager: 0,
    }),
    presence: {
        status: 'online',
    },
    sweepers: {
        guildMembers: {
            interval: 600,
            filter: discord_js_1.Sweepers.filterByLifetime({
                lifetime: 60,
            }),
        },
        messages: {
            interval: 600,
            lifetime: 60,
        },
        threadMembers: {
            interval: 600,
            filter: discord_js_1.Sweepers.filterByLifetime({
                lifetime: 1,
            }),
        },
        threads: {
            interval: 600,
            lifetime: 30,
        },
        users: {
            interval: 3600,
            filter: discord_js_1.Sweepers.filterByLifetime({
                lifetime: 3600,
            }),
        },
    },
});
client.commands = new discord_js_1.Collection();
client.config = {
    ...Constants_1.Constants.defaults.config,
    ...Constants_1.Constants.defaults.request,
};
client.cooldowns = new discord_js_1.Collection();
client.core = new core_1.Core(client);
client.customPresence = null;
client.events = new discord_js_1.Collection();
(async () => {
    await database_1.Database.init();
    const folders = (await Promise.all([
        promises_1.default.readdir(`${__dirname}/commands`),
        promises_1.default.readdir(`${__dirname}/events`),
    ])).map(file => file.filter(file1 => file1.endsWith('.js')));
    const commandPromises = [];
    const eventPromises = [];
    for (const file of folders[0]) {
        commandPromises.push(Promise.resolve().then(() => __importStar(require(`${__dirname}/commands/${file}`))));
    }
    for (const file of folders[1]) {
        eventPromises.push(Promise.resolve().then(() => __importStar(require(`${__dirname}/events/${file}`))));
    }
    const resolvedPromises = await Promise.all([
        Promise.all(commandPromises),
        Promise.all(eventPromises),
    ]);
    for (const command of resolvedPromises[0]) {
        client.commands.set(command.properties.name, command);
    }
    for (const event of resolvedPromises[1]) {
        client.events.set(event.properties.name, event);
    }
    for (const { properties: { name, once }, } of client.events.values()) {
        const execute = (...parameters) => client.events.get(name).execute(...parameters);
        if (once === false) {
            client.on(name, execute);
        }
        else {
            client.once(name, execute);
        }
    }
    await client.login();
})();
