import { BaseInteractionErrorHandler } from './BaseCommandErrorHandler';
import { CommandInteraction } from 'discord.js';
import { ErrorHandler } from './ErrorHandler';
import { Severity } from '@sentry/node';
import { UserError } from '@sapphire/framework';

export class CommandConstraintErrorHandler
    extends BaseInteractionErrorHandler<UserError> {
    readonly interaction: CommandInteraction;

    constructor(
        error: UserError,
        interaction: CommandInteraction,
    ) {
        super(error, interaction);
        this.interaction = interaction;
    }

    init() {
        try {
            this.log(this.i18n.getMessage(
                'errorsInteractionConstraintLog',
                [
                    this.interaction.user.id,
                    this.error.message,
                ],
            ));

            this.sentry
                .setSeverity(Severity.Warning)
                .commandInteractionConstraintContext(this.error.message)
                .captureMessages(this.error.message);
        } catch (error) {
            new ErrorHandler(error, this.incidentID).init();
        }
    }
}