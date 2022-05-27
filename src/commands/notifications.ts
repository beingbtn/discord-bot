import type { CommandStatic } from '../@types/Command';
import { BetterEmbed } from '../utility/BetterEmbed';
import {
    ChannelTypes,
    MessageButtonStyles,
} from 'discord.js/typings/enums';
import { constants } from '../utility/constants';
import {
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
} from 'discord.js';

export default class implements CommandStatic {
    static command = 'notifications';
    static description = 'Add a notifications selector to a channel.';
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
    };

    static async execute(interaction: CommandInteraction) {
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
    }
}