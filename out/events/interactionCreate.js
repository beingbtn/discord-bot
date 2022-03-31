"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
const discord_js_1 = require("discord.js");
const CommandConstraintErrorHandler_1 = require("../utility/errors/CommandConstraintErrorHandler");
const CommandErrorHandler_1 = require("../utility/errors/CommandErrorHandler");
const Constants_1 = require("../utility/Constants");
const ConstraintError_1 = require("../utility/errors/ConstraintError");
const Log_1 = require("../utility/Log");
const utility_1 = require("../utility/utility");
const owners = JSON.parse(process.env.OWNERS);
exports.properties = {
    name: 'interactionCreate',
    once: false,
};
const execute = async (interaction) => {
    try {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (typeof command === 'undefined') {
                return;
            }
            Log_1.Log.interaction(interaction, (0, utility_1.slashCommandResolver)(interaction));
            await interaction.deferReply({
                ephemeral: command.properties.ephemeral &&
                    interaction.inGuild(),
            });
            generalConstraints(interaction, command);
            cooldownConstraint(interaction, command);
            await command.execute(interaction);
        }
    }
    catch (error) {
        if (error instanceof ConstraintError_1.ConstraintError) {
            await CommandConstraintErrorHandler_1.CommandConstraintErrorHandler.init(error, interaction, interaction.locale);
        }
        else {
            await CommandErrorHandler_1.CommandErrorHandler.init(error, interaction, interaction.locale);
        }
    }
};
exports.execute = execute;
function generalConstraints(interaction, command) {
    const { devMode } = interaction.client.config;
    const { ownerOnly, noDM } = command.properties;
    if (devMode === true &&
        owners.includes(interaction.user.id) === false) {
        throw new ConstraintError_1.ConstraintError('devMode');
    }
    if (ownerOnly === true &&
        owners.includes(interaction.user.id) === false) {
        throw new ConstraintError_1.ConstraintError('owner');
    }
    if (noDM === true &&
        !interaction.inCachedGuild()) {
        throw new ConstraintError_1.ConstraintError('dm');
    }
}
function cooldownConstraint(interaction, command) {
    const { client: { cooldowns }, user } = interaction;
    const { name, cooldown } = command.properties;
    const timestamps = cooldowns.get(name);
    if (typeof timestamps === 'undefined') {
        cooldowns.set(name, new discord_js_1.Collection());
        cooldowns.get(name).set(user.id, Date.now());
        return;
    }
    const expireTime = Number(timestamps.get(user.id)) + cooldown;
    const isCooldown = expireTime > (Constants_1.Constants.ms.second * 2.5) + Date.now();
    const timeLeft = expireTime - Date.now();
    if (isCooldown === true) {
        throw new ConstraintError_1.ConstraintError('cooldown', timeLeft);
    }
    timestamps.set(user.id, Date.now());
}
