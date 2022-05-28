import { BaseInteractionErrorHandler } from './BaseCommandErrorHandler';
import { ErrorHandler } from './ErrorHandler';
import {
    MessageComponentInteraction,
    MessageEmbed,
} from 'discord.js';
import { Severity } from '@sentry/node';
import { Options } from '../utility/Options';

export class InteractionErrorHandler<E> extends BaseInteractionErrorHandler<E> {
    readonly interaction: MessageComponentInteraction;

    constructor(
        error: E,
        interaction: MessageComponentInteraction,
    ) {
        super(error, interaction);

        this.interaction = interaction;
    }

    static async init<T>(
        error: T,
        interaction: MessageComponentInteraction,
    ) {
        const handler = new InteractionErrorHandler(error, interaction);

        try {
            handler.errorLog();
            await handler.userNotify();
        } catch (error2) {
            new ErrorHandler(error2, handler.incidentID).init();
        }
    }

    private errorLog() {
        this.log(this.error);

        this.sentry
            .setSeverity(Severity.Error)
            .captureException(this.error);
    }

    private async userNotify() {
        const embed = new MessageEmbed()
            .setColor(Options.colorsError)
            .setTitle(this.i18n.getMessage('errorsInteractionReplyTitle'))
            .setDescription(
                this.i18n.getMessage('errorsInteractionReplyDescription',
            ))
            .addFields({
                name: this.i18n.getMessage(
                    'errorsInteractionReplyIncidentName',
                ),
                value: this.incidentID,
            });

        const payLoad = { embeds: [embed], ephemeral: true };

        try {
            if (
                this.interaction.replied === true ||
                this.interaction.deferred === true
            ) {
                await this.interaction.followUp(payLoad);
            } else {
                await this.interaction.reply(payLoad);
            }
        } catch (err) {
            const message = this.i18n.getMessage(
                'errorsInteractionReplyFailedNotify',
            );

            this.log(message, err);

            this.sentry
                .setSeverity(Severity.Error)
                .captureException(err);
        }
    }
}