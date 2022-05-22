import type {
    Scope,
    Severity,
} from '@sentry/node';
import {
    CommandInteraction,
    GuildChannel,
    Interaction,
    TextChannel,
} from 'discord.js';
import { Core } from '../core/core';
import { Pool } from 'pg';
import { slashCommandResolver } from '../utility/utility';
import * as SentryClient from '@sentry/node';

export class Sentry {
    scope: Scope;
    constructor() {
        this.scope = new SentryClient.Scope();
    }

    baseInteractionContext(interaction: Interaction) {
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
            userID: user.id,
            userTag: user.tag,
            interactionID: interaction.id,
            guildID: guild?.id,
            guildName: guild?.name,
            guildOwnerID: guild?.ownerId,
            guildMemberCount: guild?.memberCount,
            guildPermissions: guild?.me?.permissions.bitfield,
            channelID: channel?.id,
            channelType: channel?.type,
            channelName: channel instanceof TextChannel
                ? channel.name
                : null,
            channelPermissions: channel instanceof GuildChannel
                ? guild?.me?.permissionsIn(channel).bitfield
                : null,
            ping: client.ws.ping,
        });

        return this;
    }

    captureException(exception: unknown) {
        SentryClient.captureException(
            exception,
            this.scope,
        );

        return this;
    }

    captureMessages(...messages: string[]) {
        for (const message of messages) {
            SentryClient.captureMessage(
                message,
                this.scope,
            );
        }

        return this;
    }

    databaseContext(pool: Pool) {
        this.scope.setTags({
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount,
        });

        return this;
    }

    interactionConstraintContext(constraint: string) {
        this.scope.setTags({
            constraint: constraint,
        });

        return this;
    }

    requestContext(error: unknown, core: Core) {
        this.scope.setTags({
            type: error instanceof Error
                ? error.name
                : null,
            resumingIn: core.error.getTimeout(),
            lastMinuteAbort: core.error.abort.lastMinute,
            lastMinuteGeneric: core.error.generic.lastMinute,
            lastMinuteHTTP: core.error.http.lastMinute,
            nextTimeoutAbort: core.error.abort.timeout,
            nextTimeoutGeneric: core.error.generic.timeout,
            nextTimeoutHTTP: core.error.http.timeout,
            uses: core.uses,
        });

        return this;
    }

    setSeverity(level: Severity) {
        this.scope.setLevel(level);

        return this;
    }
}