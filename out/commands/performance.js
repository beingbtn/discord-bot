"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const Constants_1 = require("../utility/Constants");
const utility_1 = require("../utility/utility");
const RegionLocales_1 = require("../locales/RegionLocales");
exports.properties = {
    name: 'performance',
    description: 'View system performance.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'performance',
        description: 'View system performance',
    },
};
const execute = async (interaction) => {
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.performance;
    const { replace } = RegionLocales_1.RegionLocales;
    const { fetch: fetchPerformance, parse: parsePerformance, check: checkPerformance, send: sendPerformance, total, } = interaction.client.core.performance.latest;
    const responseEmbed = new utility_1.BetterEmbed(interaction)
        .setColor(Constants_1.Constants.colors.normal)
        .setTitle(text.title)
        .addFields({
        name: text.latest.name,
        value: replace(text.latest.value, {
            fetchPerformance: fetchPerformance,
            parsePerformance: parsePerformance,
            checkPerformance: checkPerformance,
            sendPerformance: sendPerformance,
            total: total,
        }),
    });
    await interaction.editReply({
        embeds: [responseEmbed],
    });
};
exports.execute = execute;
