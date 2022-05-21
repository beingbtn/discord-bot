import {
    CommandInteraction,
    GuildChannel,
    Interaction,
    TextChannel,
} from 'discord.js';
import { BaseErrorHandler } from './BaseErrorHandler';
import { constants } from '../utility/constants';
import { i18n } from '../locales/i18n';
import { slashCommandResolver, timestamp } from '../utility/utility';

export class BaseInteractionErrorHandler<E> extends BaseErrorHandler<E> {
    readonly interaction: Interaction;

    constructor(
        error: E,
        interaction: Interaction,
    ) {
        super(error);
        this.interaction = interaction;
        this.i18n = new i18n(this.interaction.locale);
    }

    interactionErrorEmbed() {
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
                    name: this.i18n.getMessage(
                        'errorsInteractionInformationUserName',
                    ),
                    value: this.i18n.getMessage(
                        'errorsInteractionInformationUserValue',
                        [
                            user.tag,
                            user.id,
                        ],
                    ),
                },
                {
                    name: this.i18n.getMessage(
                        'errorsInteractionInformationInteractionName',
                    ),
                    value: this.i18n.getMessage(
                        'errorsInteractionInformationInteractionValue',
                        [
                            id,
                            command ?? this.i18n.getMessage('null'),
                            timestamp(
                                createdTimestamp / constants.ms.second,
                                'T',
                            )!,
                        ],
                    ),
                },
                {
                    name: this.i18n.getMessage(
                        'errorsInteractionInformationGuildName',
                    ),
                    value: this.i18n.getMessage(
                        'errorsInteractionInformationGuildValue',
                        [
                            guild?.id,
                            guild?.name,
                            guild?.ownerId,
                            guild?.memberCount,
                            guild?.me?.permissions.bitfield,
                        ].map(item =>
                            item ??
                            this.i18n.getMessage('null'),
                        ),
                    ),
                },
                {
                    name: this.i18n.getMessage(
                        'errorsInteractionInformationChannelName',
                    ),
                    value: this.i18n.getMessage(
                        'errorsInteractionInformationChannelValue',
                        [
                            channel?.id,
                            channel?.type,
                            channel instanceof TextChannel
                                ? channel.name
                                : null,
                            channel instanceof GuildChannel
                                ? guild?.me?.permissionsIn(channel).bitfield
                                : null,
                        ].map(item =>
                            item ??
                            this.i18n.getMessage('null'),
                        ),
                    ),
                },
                {
                    name: this.i18n.getMessage(
                        'errorsInteractionInformationOtherName',
                    ),
                    value: this.i18n.getMessage(
                        'errorsInteractionInformationOtherValue',
                        [
                            client.ws.ping,
                        ],
                    ),
                },
            );
    }
}