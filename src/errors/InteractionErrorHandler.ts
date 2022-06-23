import {
    type CommandInteraction,
    type MessageComponentInteraction,
    MessageEmbed,
    ContextMenuInteraction,
} from 'discord.js';
import { BaseInteractionErrorHandler } from './BaseInteractionErrorHandler';
import { ErrorHandler } from './ErrorHandler';
import { Options } from '../utility/Options';

export class InteractionErrorHandler<E> extends BaseInteractionErrorHandler<E> {
    readonly interaction: CommandInteraction | ContextMenuInteraction | MessageComponentInteraction;

    private constructor(
        error: E,
        interaction: CommandInteraction | ContextMenuInteraction | MessageComponentInteraction,
    ) {
        super(error, interaction);

        this.interaction = interaction;
    }

    static async init<T>(
        error: T,
        interaction: CommandInteraction | ContextMenuInteraction | MessageComponentInteraction,
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
            .setSeverity('error')
            .captureException(this.error);
    }

    private async userNotify() {
        const embed = new MessageEmbed()
            .setColor(Options.colorsError)
            .setTitle(
                this.i18n.getMessage(
                    'errorsInteractionReplyTitle',
                ),
            )
            .setDescription(
                this.i18n.getMessage(
                    'errorsInteractionReplyDescription',
                ),
            )
            .addFields({
                name: this.i18n.getMessage(
                    'errorsInteractionReplyIncidentName',
                ),
                value: this.incidentID,
            });

        const payLoad = {
            embeds: [embed],
            ephemeral: true,
        };

        try {
            if (
                this.interaction.replied === true
                || this.interaction.deferred === true
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
                .setSeverity('error')
                .captureException(err);
        }
    }
}