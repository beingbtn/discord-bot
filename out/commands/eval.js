"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const utility_1 = require("../utility/utility");
const Constants_1 = require("../utility/Constants");
const discord_js_1 = require("discord.js");
const Log_1 = require("../utility/Log");
const RegionLocales_1 = require("../locales/RegionLocales");
exports.properties = {
    name: 'eval',
    description: 'Evaluates a string.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
        name: 'eval',
        description: 'Evaluates a string',
        options: [
            {
                name: 'string',
                type: 3,
                description: 'Code',
                required: true,
            },
        ],
    },
};
const execute = async (interaction) => {
    const text = RegionLocales_1.RegionLocales.locale(interaction.locale).commands.eval;
    const { replace } = RegionLocales_1.RegionLocales;
    const input = interaction.options.getString('string', true);
    try {
        const start = Date.now();
        const output = await eval(input); //eslint-disable-line no-eval
        const end = Date.now();
        const timeTaken = end - start;
        const outputMaxLength = output?.length >= Constants_1.Constants.limits.embedField;
        const evalEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.normal)
            .setTitle(text.success.title)
            .addFields({
            name: text.success.input.name,
            value: replace(text.success.input.value, {
                input: discord_js_1.Formatters.codeBlock('javascript', input),
            }),
        }, {
            name: text.success.output.name,
            value: replace(text.success.output.value, {
                output: discord_js_1.Formatters.codeBlock('javascript', output
                    ?.toString()
                    ?.slice(0, Constants_1.Constants.limits.embedField)),
            }),
        }, {
            name: text.success.type.name,
            value: replace(text.success.type.value, {
                type: discord_js_1.Formatters.codeBlock(typeof output),
            }),
        }, {
            name: text.success.timeTaken.name,
            value: replace(text.success.timeTaken.value, {
                ms: discord_js_1.Formatters.codeBlock(`${timeTaken}ms`),
            }),
        });
        if (outputMaxLength === true) {
            evalEmbed.addFields({
                name: text.maxLength.name,
                value: text.maxLength.value,
            });
        }
        Log_1.Log.interaction(interaction, 'Output: ', output);
        await interaction.editReply({ embeds: [evalEmbed] });
    }
    catch (error) {
        const outputMaxLength = Boolean(error.message.length >= Constants_1.Constants.limits.embedField);
        const evalEmbed = new utility_1.BetterEmbed(interaction)
            .setColor(Constants_1.Constants.colors.warning)
            .setTitle(text.fail.title)
            .addFields({
            name: text.fail.input.name,
            value: replace(text.fail.input.value, {
                input: discord_js_1.Formatters.codeBlock('javascript', input),
            }),
        });
        if (outputMaxLength === true) {
            evalEmbed.addFields({
                name: text.maxLength.name,
                value: text.maxLength.value,
            });
        }
        const errorStackAttachment = {
            attachment: Buffer.from(error instanceof Error &&
                error.stack
                ? error.stack
                : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)),
            name: error instanceof Error
                ? `${error.name}.txt`
                : 'error.txt',
        };
        await interaction.editReply({
            embeds: [evalEmbed],
            files: [errorStackAttachment],
        });
    }
};
exports.execute = execute;
