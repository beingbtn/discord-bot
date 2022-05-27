import type { ClientCommand } from '../@types/main';
import { BetterEmbed } from '../utility/BetterEmbed';
import {
    ChannelTypes,
    MessageButtonStyles,
} from 'discord.js/typings/enums';
import { constants } from '../utility/constants';
import {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
} from 'discord.js';

export const properties: ClientCommand['properties'] = {
    name: 'notifications',
    description: 'Add a notifications selector to a channel.',
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
        name: 'notifications',
        description: 'Add a notifications selector to a channel',
        options: [
            {
                name: 'channel',
                description: 'The channel to add the selector to',
                type: 7,
                channel_types: [ChannelTypes.GUILD_TEXT],
                required: true,
            },
        ],
    },
};

export const execute: ClientCommand['execute'] = async (
    interaction,
): Promise<void> => {
    const { i18n } = interaction;

    const notificationsEmbed = new MessageEmbed()
        .setColor(constants.colors.normal)
        .setTitle(
            i18n.getMessage('commandsNotificationsPublicTitle'),
        )
        .setDescription(
            i18n.getMessage('commandsNotificationsPublicDescription'),
        );

    const announcements = JSON.parse(process.env.ANNOUNCEMENTS!) as {
        [key: string]: {
            id: string,
        }
    };

    const actionRow = new MessageActionRow()
        .setComponents(
            Object.entries(announcements).map(
                ([key]) => new MessageButton()
                    .setCustomId(key)
                    .setLabel(key)
                    .setStyle(MessageButtonStyles.PRIMARY),
            ),
        );

    const channel = interaction.options.getChannel(
        'channel',
        true,
    ) as TextChannel;

    await channel.send({
        embeds: [notificationsEmbed],
        components: [actionRow],
    });

    const embed = new BetterEmbed(interaction)
        .setColor(constants.colors.normal)
        .setTitle(i18n.getMessage('commandsNotificationsPrivateTitle'));

    await interaction.editReply({ embeds: [embed] });
};