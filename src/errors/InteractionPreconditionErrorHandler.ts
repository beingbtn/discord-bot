import { setTimeout } from 'node:timers/promises';
import {
    type Command,
    type UserError,
} from '@sapphire/framework';
import {
    CommandInteraction,
    ContextMenuInteraction,
    type BaseCommandInteraction,
    type ColorResolvable,
} from 'discord.js';
import { BaseInteractionErrorHandler } from './BaseInteractionErrorHandler';
import { Identifiers } from '../enums/Identifiers';
import { Time } from '../enums/Time';
import { ErrorHandler } from './ErrorHandler';
import { BetterEmbed } from '../structures/BetterEmbed';
import { cleanRound } from '../utility/utility';
import { Options } from '../utility/Options';

export class InteractionPreconditionErrorHandler extends BaseInteractionErrorHandler<UserError> {
    readonly interaction: CommandInteraction | ContextMenuInteraction;

    readonly command: Command;

    public constructor(
        error: UserError,
        interaction: CommandInteraction | ContextMenuInteraction,
        command: Command,
    ) {
        super(error, interaction);
        this.interaction = interaction;
        this.command = command;
    }

    public async init() {
        try {
            this.log(
                `${this.constructor.name}:`,
                `${this.interaction.user.id} failed ${this.error.identifier}.`,
            );

            this.sentry
                .setSeverity('warning')
                .baseInteractionPreconditionContext(this.error.identifier)
                .captureMessages(this.error.identifier);

            switch (this.error.identifier) {
                case Identifiers.DevMode:
                    await this.resolveConstraint(
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
                case Identifiers.OwnerOnly:
                    await this.resolveConstraint(
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
                case Identifiers.GuildOnly:
                    await this.resolveConstraint(
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
                case Identifiers.Cooldown:
                    await this.resolveConstraint(
                        this.interaction,
                        this.interaction.i18n.getMessage(
                            'errorsPreconditionCooldownWaitingTitle',
                        ),
                        this.interaction.i18n.getMessage(
                            'errorsPreconditionCooldownWaitingDescription', [
                                this.command.options.cooldownLimit!,
                                this.command.options.cooldownDelay! / Time.Second,
                                cleanRound(
                                    (
                                        this.error.context as {
                                            remaining: number,
                                        }
                                    ).remaining / Time.Second,
                                ),
                            ],
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
                            'errorsPreconditionCooldownCooldownOverTitle',
                        ),
                        this.interaction.i18n.getMessage(
                            'errorsPreconditionCooldownCooldownOverDescription', [
                                this.interaction.commandName,
                            ],
                        ),
                        Options.colorsOn,
                    );
                    break;

                // TODO: Support client/user local/global permissions
                // no default
            }
        } catch (error) {
            new ErrorHandler(error, this.incidentID).init();
        }
    }

    private async resolveConstraint(
        interaction: BaseCommandInteraction,
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