import type { UserError } from '@sapphire/framework';
import { BaseInteractionErrorHandler } from './BaseCommandErrorHandler';
import { BetterEmbed } from '../utility/BetterEmbed';
import {
    ColorResolvable,
    CommandInteraction,
} from 'discord.js';
import { ErrorHandler } from './ErrorHandler';
import { Options } from '../utility/Options';
import { Preconditions } from '../enums/Preconditions';
import { Severity } from '@sentry/node';
import { setTimeout } from 'timers/promises';

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

    async init() {
        try {
            this.log(this.i18n.getMessage(
                'errorsPreconditionLog',
                [
                    this.interaction.user.id,
                    this.error.message,
                ],
            ));

            this.sentry
                .setSeverity(Severity.Warning)
                .commandInteractionConstraintContext(this.error.message)
                .captureMessages(this.error.message);

            switch (this.error.identifier) {
                case Preconditions.DevMode: await this.resolveConstraint(
                    this.interaction,
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionDevModeTitle',
                    ),
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionDevModeDescription',
                    ),
                    Options.colorsWarning,
                );
                break;
                case Preconditions.OwnerOnly: await this.resolveConstraint(
                    this.interaction,
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionOwnerTitle',
                    ),
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionOwnerDescription',
                    ),
                    Options.colorsWarning,
                );
                break;
                case Preconditions.GuildOnly: await this.resolveConstraint(
                    this.interaction,
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionDMTitle',
                    ),
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionDMDescription',
                    ),
                    Options.colorsWarning,
                );
                break;
                case Preconditions.Cooldown: await this.resolveConstraint(
                    this.interaction,
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionCooldownWaitingTitle',
                    ),
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionCooldownWaitingTitle',
                    ),
                    Options.colorsWarning,
                );

                await setTimeout(
                    (this.error.context as {
                        remaining: number,
                    }).remaining,
                );

                await this.resolveConstraint(
                    this.interaction,
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionCooldownWaitingTitle',
                    ),
                    this.interaction.i18n.getMessage(
                        'errorsPreconditionCooldownWaitingTitle',
                    ),
                    Options.colorsOk,
                );
                break;

                //TODO: Support client/user local/global permissions
                //No default
            }
        } catch (error) {
            new ErrorHandler(error, this.incidentID).init();
        }
    }

    private async resolveConstraint(
        interaction: CommandInteraction,
        title: string,
        description: string,
        color: ColorResolvable,
    ) {
        const embed = new BetterEmbed(interaction)
            .setColor(color)
            .setTitle(title)
            .setDescription(description);

        await interaction.editReply({
            embeds: [embed],
        });
    }
}