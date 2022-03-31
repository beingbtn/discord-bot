"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const utility_1 = require("../utility/utility");
const Constants_1 = require("../utility/Constants");
const RegionLocales_1 = require("../locales/RegionLocales");
const node_process_1 = __importDefault(require("node:process"));
exports.properties = {
    name: 'system',
    description: 'View system information.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'system',
        description: 'View system information',
    },
};
const execute = async (interaction) => {
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.system;
    const { replace } = RegionLocales_1.RegionLocales;
    const memoryMegaBytes = node_process_1.default.memoryUsage.rss() / (2 ** 20);
    const responseEmbed = new utility_1.BetterEmbed(interaction)
        .setColor(Constants_1.Constants.colors.normal)
        .setTitle(text.embed.title)
        .addFields({
        name: text.embed.field1.name,
        value: replace(text.embed.field1.value, {
            uptime: (0, utility_1.cleanLength)(node_process_1.default.uptime() * 1000),
        }),
    }, {
        name: text.embed.field2.name,
        value: replace(text.embed.field2.value, {
            memoryMegaBytes: (0, utility_1.cleanRound)(memoryMegaBytes, 1),
        }),
    }, {
        name: text.embed.field3.name,
        value: replace(text.embed.field3.value, {
            servers: interaction.client.guilds.cache.size,
        }),
    }, {
        name: text.embed.field4.name,
        value: replace(text.embed.field4.value, {
            users: interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
        }),
    });
    await interaction.editReply({
        embeds: [responseEmbed],
    });
};
exports.execute = execute;
