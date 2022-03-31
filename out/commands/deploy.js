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
exports.execute = exports.properties = void 0;
const utility_1 = require("../utility/utility");
const Constants_1 = require("../utility/Constants");
const Log_1 = require("../utility/Log");
const RegionLocales_1 = require("../locales/RegionLocales");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const promises_1 = __importDefault(require("node:fs/promises"));
exports.properties = {
    name: 'deploy',
    description: 'Deploy commands.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'deploy',
        description: 'Deploy commands',
        options: [
            {
                name: 'scope',
                description: 'Global or Guild',
                type: 3,
                required: true,
                choices: [
                    {
                        name: 'Global',
                        value: 'global',
                    },
                    {
                        name: 'Guild',
                        value: 'guild',
                    },
                ],
            },
            {
                name: 'type',
                description: 'User or Owner commands',
                type: 3,
                required: true,
                choices: [
                    {
                        name: 'User',
                        value: 'user',
                    },
                    {
                        name: 'Owner',
                        value: 'owner',
                    },
                    {
                        name: 'Both',
                        value: 'both',
                    },
                    {
                        name: 'None',
                        value: 'none',
                    },
                ],
            },
            {
                name: 'guild',
                description: 'Guild ID',
                type: 3,
                required: false,
            },
        ],
    },
};
const execute = async (interaction) => {
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.deploy;
    const commandFiles = (await promises_1.default.readdir(__dirname)).filter(file => file.endsWith('.js'));
    const userCommands = [];
    const ownerCommands = [];
    for (const file of commandFiles) {
        const { properties: { ownerOnly, structure }, } = await Promise.resolve().then(() => __importStar(require(`${__dirname}/${file}`))); // eslint-disable-line no-await-in-loop
        if (ownerOnly === false) {
            userCommands.push(structure);
        }
        else {
            ownerCommands.push(structure);
        }
    }
    const scope = interaction.options.getString('scope', true);
    const type = interaction.options.getString('type', true);
    const guildID = interaction.options.getString('guild') ??
        interaction.guildId;
    const commands = type === 'both'
        ? ownerCommands.concat(userCommands)
        : type === 'none'
            ? []
            : type === 'owner'
                ? ownerCommands
                : userCommands;
    const token = process.env.discordAPIKey;
    const rest = new rest_1.REST({ version: '9' }).setToken(token);
    const clientID = process.env.CLIENT_ID;
    if (scope === 'global') {
        await rest.put(v9_1.Routes.applicationCommands(clientID), {
            body: commands,
        });
    }
    else {
        await rest.put(v9_1.Routes.applicationGuildCommands(clientID, guildID), {
            body: commands,
        });
    }
    const successEmbed = new utility_1.BetterEmbed(interaction)
        .setColor(Constants_1.Constants.colors.normal)
        .setTitle(text.title)
        .setDescription(JSON.stringify(commands).slice(0, Constants_1.Constants.limits.embedDescription) ?? text.none);
    Log_1.Log.interaction(interaction, `Scope: ${scope} | Type: ${type} | Guild ID: ${guildID}`);
    await interaction.editReply({ embeds: [successEmbed] });
};
exports.execute = execute;
