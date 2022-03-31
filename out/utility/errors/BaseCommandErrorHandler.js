"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommandErrorHandler = void 0;
const discord_js_1 = require("discord.js");
const BaseErrorHandler_1 = require("../../utility/errors/BaseErrorHandler");
const Constants_1 = require("../Constants");
const utility_1 = require("../utility");
class BaseCommandErrorHandler extends BaseErrorHandler_1.BaseErrorHandler {
    constructor(error, interaction) {
        super(error);
        this.interaction = interaction;
    }
    getGuildInformation() {
        const { client, channel, createdTimestamp, guild, id, user, } = this.interaction;
        const command = (0, utility_1.slashCommandResolver)(this.interaction);
        return this.baseErrorEmbed()
            .addFields({
            name: 'User',
            value: `Tag: ${user.tag}
                    ID: ${user.id}`,
        }, {
            name: 'Interaction',
            value: `ID: ${id}
                    Command: ${command}
                    Created At: <t:${Math.round(createdTimestamp / Constants_1.Constants.ms.second)}:T>`,
        }, {
            name: 'Guild',
            value: `Guild ID: ${guild?.id ?? 'N/A'}
                    Guild Name: ${guild?.name ?? 'N/A'}
                    Owner ID: ${guild?.ownerId ?? 'N/A'}
                    Guild Member Count: ${guild?.memberCount ?? 'N/A'}
                    Permissions: ${guild?.me?.permissions.bitfield ?? 'N/A'}`,
        }, {
            name: 'Channel',
            value: `Channel ID: ${channel?.id ?? 'N/A'}
                    Channel Type: ${channel?.type ?? 'N/A'}
                    Name: ${channel instanceof discord_js_1.TextChannel
                ? channel.name
                : 'N/A'}
                    Permissions: ${channel instanceof discord_js_1.GuildChannel
                ? guild?.me?.permissionsIn(channel).bitfield
                : 'N/A'}`,
        }, {
            name: 'Other',
            value: `Websocket Ping: ${client.ws.ping}`,
        });
    }
}
exports.BaseCommandErrorHandler = BaseCommandErrorHandler;
