import type { CommandStatic } from '../@types/Command';
import {
    ColorResolvable,
    CommandInteraction,
    Message,
} from 'discord.js';
import { BetterEmbed } from '../utility/BetterEmbed';
import { constants } from '../utility/constants';
import { Log } from '../utility/Log';

export default class implements CommandStatic {
    static cooldown = 0;
    static ephemeral = true;
    static noDM = false;
    static ownerOnly = true;
    static permissions = {
        bot: {
            global: [],
            local: [],
        },
        user: {
            global: [],
            local: [],
        },
    };
    static structure = {
        name: 'ping',
        description: 'Ping!',
    };

    static async execute(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const initialPingEmbed = new BetterEmbed(interaction)
            .setColor(constants.colors.normal)
            .setTitle(i18n.getMessage('commandsPingLoadingTitle'));

        const sentReply = await interaction.editReply({
            embeds: [initialPingEmbed],
        });

        const roundTripDelay =
            (
                sentReply instanceof Message
                    ? sentReply.createdTimestamp
                    : Date.parse(sentReply.timestamp)
            ) - interaction.createdTimestamp;

        const embedColor: ColorResolvable =
            interaction.client.ws.ping < 80 && roundTripDelay < 160
                ? constants.colors.on
                : interaction.client.ws.ping < 100 && roundTripDelay < 250
                    ? constants.colors.ok
                    : constants.colors.warning;

        const pingEmbed = new BetterEmbed(interaction)
            .setColor(embedColor)
            .setTitle(i18n.getMessage('commandsPingTitle'))
            .setDescription(i18n.getMessage('commandsPingDescription', [
                interaction.client.ws.ping,
                roundTripDelay,
            ]));

        Log.interaction(interaction, `WS: ${interaction.client.ws.ping}ms | RT: ${roundTripDelay}ms`);

        await interaction.editReply({ embeds: [pingEmbed] });
    }
}