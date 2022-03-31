"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandConstraintErrorHandler = void 0;
const BaseCommandErrorHandler_1 = require("./BaseCommandErrorHandler");
const utility_1 = require("../../utility/utility");
const Constants_1 = require("../Constants");
const ErrorHandler_1 = require("../../utility/errors/ErrorHandler");
const RegionLocales_1 = require("../../locales/RegionLocales");
const promises_1 = require("node:timers/promises");
class CommandConstraintErrorHandler extends BaseCommandErrorHandler_1.BaseCommandErrorHandler {
    constructor(error, interaction, locale) {
        super(error, interaction);
        this.interaction = interaction;
        this.locale = locale;
    }
    static async init(error, interaction, locale) {
        const handler = new CommandConstraintErrorHandler(error, interaction, locale);
        try {
            handler.errorLog();
            await handler.systemNotify();
            await handler.userNotify();
        }
        catch (error2) {
            await ErrorHandler_1.ErrorHandler.init(error2, handler.incidentID);
        }
    }
    errorLog() {
        this.log(`${this.interaction.user.id} failed the constraint ${this.error.message}`);
    }
    async userNotify() {
        const { commandName } = this.interaction;
        const text = RegionLocales_1.RegionLocales
            .locale(this.locale)
            .errors;
        const constraint = text.constraintErrors[this.error.message];
        if (this.error.message === 'cooldown') {
            const embed1 = constraint.embed1;
            const embed2 = constraint.embed2;
            const command = this.interaction.client.commands.get(commandName);
            this.constraintResolver(embed1.title, RegionLocales_1.RegionLocales.replace(embed1.description, {
                cooldown: (command?.properties.cooldown ?? 0) /
                    Constants_1.Constants.ms.second,
                timeLeft: (0, utility_1.cleanRound)(this.error.cooldown /
                    Constants_1.Constants.ms.second, 1),
            }));
            await (0, promises_1.setTimeout)(this.error.cooldown);
            this.constraintResolver(embed2.title, RegionLocales_1.RegionLocales.replace(embed2.description, {
                commandName: commandName,
            }), Constants_1.Constants.colors.on);
            return;
        }
        const embed = constraint;
        this.constraintResolver(embed.title, embed.description);
    }
    async constraintResolver(title, description, color) {
        const embed = new utility_1.BetterEmbed(this.interaction)
            .setColor(color ?? Constants_1.Constants.colors.warning)
            .setTitle(title)
            .setDescription(description);
        await this.interaction.editReply({
            embeds: [embed],
        });
    }
    async systemNotify() {
        const embeds = [this.getGuildInformation()];
        embeds[0]
            .setTitle('User Failed Constraint')
            .setDescription(`Constraint: ${this.error.message}`);
        await (0, utility_1.sendWebHook)({
            embeds: embeds,
            webhook: JSON.parse(process.env.WEBHOOK_NON_FATAL),
            suppressError: true,
        });
    }
}
exports.CommandConstraintErrorHandler = CommandConstraintErrorHandler;
