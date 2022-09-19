import * as SentryClient from '@sentry/node';
import {
    CommandInteraction,
    GuildChannel,
    type Interaction,
    TextChannel,
} from 'discord.js';
import { slashCommandResolver } from '../utility/utility';

export class Sentry {
    public readonly scope: SentryClient.Scope;

    public constructor() {
        this.scope = new SentryClient.Scope();
    }

    public baseErrorContext(incidentId: string) {
        this.scope.setTags({
            incidentId: incidentId,
        });

        return this;
    }

    public baseInteractionContext(interaction: Interaction) {
        const {
            user,
            guild,
            channel,
            client,
        } = interaction;

        this.scope.setTags({
            interactionCommand: interaction instanceof CommandInteraction
                ? slashCommandResolver(
                    interaction,
                ).slice(0, 200)
                : null,
            interactionCreatedTimestamp: interaction.createdTimestamp,
            userId: user.id,
            interactionId: interaction.id,
            guildId: guild?.id,
            guildName: guild?.name,
            guildOwnerId: guild?.ownerId,
            guildMemberCount: guild?.memberCount,
            guildPermissions: guild?.me?.permissions.bitfield.toString(),
            channelId: channel?.id,
            channelType: channel?.type,
            channelName: channel instanceof TextChannel
                ? channel.name
                : null,
            channelPermissions: channel instanceof GuildChannel
                ? guild?.me?.permissionsIn(channel).bitfield.toString()
                : null,
            ping: client.ws.ping,
        });

        return this;
    }

    public captureException(exception: unknown) {
        SentryClient.captureException(
            exception,
            this.scope,
        );

        return this;
    }

    public captureMessages(...messages: string[]) {
        messages.forEach((message) => {
            SentryClient.captureMessage(
                message,
                this.scope,
            );
        });

        return this;
    }

    public baseInteractionPreconditionContext(precondition: string) {
        this.scope.setTags({
            precondition: precondition,
        });

        return this;
    }

    public setSeverity(level: SentryClient.SeverityLevel) {
        this.scope.setLevel(level);

        return this;
    }
}