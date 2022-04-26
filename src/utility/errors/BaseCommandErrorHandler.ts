import {
    ButtonInteraction,
    CommandInteraction,
    GuildChannel,
    TextChannel,
} from 'discord.js';
import { BaseErrorHandler } from '../../utility/errors/BaseErrorHandler';
import { Constants } from '../Constants';
import { slashCommandResolver } from '../utility';

export class BaseCommandErrorHandler<E> extends BaseErrorHandler<E> {
    readonly interaction: CommandInteraction | ButtonInteraction;

    constructor(
        error: E,
        interaction: CommandInteraction | ButtonInteraction,
    ) {
        super(error);
        this.interaction = interaction;
    }

    getGuildInformation() {
        const {
            client,
            channel,
            createdTimestamp,
            guild,
            id,
            user,
        } = this.interaction;

        const command = this.interaction instanceof CommandInteraction
            ? slashCommandResolver(
                this.interaction,
            )
            : null;

        return this.baseErrorEmbed()
            .addFields(
                {
                    name: 'User',
                    value: `Tag: ${user.tag}
                    ID: ${user.id}`,
                },
                {
                    name: 'Interaction',
                    value: `ID: ${id}
                    Command: ${command ?? 'N/A'}
                    Created At: <t:${Math.round(
                        createdTimestamp / Constants.ms.second,
                    )}:T>`,
                },
                {
                    name: 'Guild',
                    value: `Guild ID: ${guild?.id ?? 'N/A'}
                    Guild Name: ${guild?.name ?? 'N/A'}
                    Owner ID: ${guild?.ownerId ?? 'N/A'}
                    Guild Member Count: ${guild?.memberCount ?? 'N/A'}
                    Permissions: ${guild?.me?.permissions.bitfield ?? 'N/A'}`,
                },
                {
                    name: 'Channel',
                    value: `Channel ID: ${channel?.id ?? 'N/A'}
                    Channel Type: ${channel?.type ?? 'N/A'}
                    Name: ${
                        channel instanceof TextChannel
                            ? channel.name
                            : 'N/A'
                    }
                    Permissions: ${
                        channel instanceof GuildChannel
                            ? guild?.me?.permissionsIn(channel).bitfield
                            : 'N/A'
                    }`,
                },
                {
                    name: 'Other',
                    value: `Websocket Ping: ${client.ws.ping}`,
                },
            );
    }
}