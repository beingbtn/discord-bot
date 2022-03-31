"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandErrorHandler = void 0;
const BaseCommandErrorHandler_1 = require("./BaseCommandErrorHandler");
const discord_js_1 = require("discord.js");
const Constants_1 = require("../Constants");
const ErrorHandler_1 = require("../../utility/errors/ErrorHandler");
const RegionLocales_1 = require("../../locales/RegionLocales");
const utility_1 = require("../../utility/utility");
const fatalWebhook = JSON.parse(process.env.WEBHOOK_FATAL);
const owners = JSON.parse(process.env.OWNERS);
class CommandErrorHandler extends BaseCommandErrorHandler_1.BaseCommandErrorHandler {
    constructor(error, interaction, locale) {
        super(error, interaction);
        this.interaction = interaction;
        this.locale = locale;
    }
    static async init(error, interaction, locale) {
        const handler = new CommandErrorHandler(error, interaction, locale);
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
        this.log(this.error);
    }
    async userNotify() {
        const { commandName } = this.interaction;
        const text = RegionLocales_1.RegionLocales
            .locale(this.locale)
            .errors;
        const { replace } = RegionLocales_1.RegionLocales;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(Constants_1.Constants.colors.error)
            .setTitle(text.commandErrors.embed.title)
            .setDescription(replace(text.commandErrors.embed.description, {
            commandName: commandName,
        }))
            .addFields({
            name: text.commandErrors.embed.field.name,
            value: replace(text.commandErrors.embed.field.value, {
                id: this.incidentID,
            }),
        });
        const payLoad = { embeds: [embed], ephemeral: true };
        try {
            if (this.interaction.replied === true ||
                this.interaction.deferred === true) {
                await this.interaction.followUp(payLoad);
            }
            else {
                await this.interaction.reply(payLoad);
            }
        }
        catch (err) {
            const message = 'An error has occurred and also failed to notify the user';
            this.log(message, err);
            const failedEmbed = this
                .errorEmbed()
                .setDescription(message);
            await (0, utility_1.sendWebHook)({
                content: `<@${owners.join('><@')}>`,
                embeds: [failedEmbed],
                files: [this.stackAttachment],
                webhook: fatalWebhook,
                suppressError: true,
            });
        }
    }
    async systemNotify() {
        const embeds = [this.getGuildInformation(), this.errorEmbed()];
        embeds[0].setTitle('Unexpected Error');
        await (0, utility_1.sendWebHook)({
            content: `<@${owners.join('><@')}>`,
            embeds: embeds,
            files: [this.stackAttachment],
            webhook: fatalWebhook,
            suppressError: true,
        });
    }
}
exports.CommandErrorHandler = CommandErrorHandler;
