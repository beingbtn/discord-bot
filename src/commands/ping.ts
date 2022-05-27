import type { ClientCommand } from '../@types/main';
import {
    ColorResolvable,
    Message,
} from 'discord.js';
import { BetterEmbed } from '../utility/BetterEmbed';
import { constants } from '../utility/constants';
import { Log } from '../utility/Log';

export const properties: ClientCommand['properties'] = {
    name: 'ping',
    description: 'Returns the ping of the bot.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    permissions: {
        bot: {
            global: [],
            local: [],
        },
        user: {
            global: [],
            local: [],
        },
    },
    structure: {
        name: 'ping',
        description: 'Ping!',
    },
};

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const { i18n } = interaction;

    const initialPingEmbed = new BetterEmbed(interaction)
        .setColor(constants.colors.normal)
        .setTitle(i18n.getMessage('commandsPingLoadingTitle'));

    const sentReply = await interaction.editReply({
        embeds: [initialPingEmbed],
    });

    const roundTripDelay =
        (sentReply instanceof Message
            ? sentReply.createdTimestamp
            : Date.parse(sentReply.timestamp)) - interaction.createdTimestamp;

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
};