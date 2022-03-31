"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const discord_js_1 = require("discord.js");
const utility_1 = require("../utility/utility");
const Constants_1 = require("../utility/Constants");
const Log_1 = require("../utility/Log");
const RegionLocales_1 = require("../locales/RegionLocales");
exports.properties = {
    name: 'ping',
    description: 'Returns the ping of the bot.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'ping',
        description: 'Ping!',
    },
};
const execute = async (interaction) => {
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.ping;
    const replace = RegionLocales_1.RegionLocales.replace;
    const initialPingEmbed = new utility_1.BetterEmbed(interaction)
        .setColor(Constants_1.Constants.colors.normal)
        .setTitle(text.embed1.title);
    const sentReply = await interaction.editReply({
        embeds: [initialPingEmbed],
    });
    const roundTripDelay = (sentReply instanceof discord_js_1.Message
        ? sentReply.createdTimestamp
        : Date.parse(sentReply.timestamp)) - interaction.createdTimestamp;
    const embedColor = interaction.client.ws.ping < 80 && roundTripDelay < 160
        ? Constants_1.Constants.colors.on
        : interaction.client.ws.ping < 100 && roundTripDelay < 250
            ? Constants_1.Constants.colors.ok
            : Constants_1.Constants.colors.warning;
    const pingEmbed = new utility_1.BetterEmbed(interaction)
        .setColor(embedColor)
        .setTitle(text.embed2.title)
        .setDescription(replace(text.embed2.description, {
        wsPing: interaction.client.ws.ping,
        rtPing: roundTripDelay,
    }));
    Log_1.Log.interaction(interaction, `WS: ${interaction.client.ws.ping}ms | RT: ${roundTripDelay}ms`);
    await interaction.editReply({ embeds: [pingEmbed] });
};
exports.execute = execute;
