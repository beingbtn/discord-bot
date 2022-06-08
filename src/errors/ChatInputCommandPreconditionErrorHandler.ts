import type {
    Command,
    UserError,
} from '@sapphire/framework';
import { BaseInteractionErrorHandler } from './BaseInteractionErrorHandler';
import { BetterEmbed } from '../structures/BetterEmbed';
import {
    BaseCommandInteraction,
    ColorResolvable,
} from 'discord.js';
import { cleanRound } from '../utility/utility';
import { ErrorHandler } from './ErrorHandler';
import { Options } from '../utility/Options';
import { Preconditions } from '../enums/Preconditions';
import { Severity } from '@sentry/node';
import { setTimeout } from 'timers/promises';
import { Time } from '../enums/Time';

export class ChatInputCommandPreconditionErrorHandler
    extends BaseInteractionErrorHandler<UserError> {
    readonly interaction: BaseCommandInteraction;
    readonly command: Command;

    public constructor(
        error: UserError,
        interaction: BaseCommandInteraction,
        command: Command,
    ) {
        super(error, interaction);
        this.interaction = interaction;
        this.command = command;
    }

    public async init() {
        try {
            this.log(this.i18n.getMessage(
                'errorsPreconditionLog', [
                    this.interaction.user.id,
                    this.error.identifier,
                ],
            ));

            this.sentry
                .setSeverity(Severity.Warning)
                .baseInteractionPreconditionContext(this.error.identifier)
                .captureMessages(this.error.identifier);

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
                        'errorsPreconditionCooldownWaitingDescription', [
                            this.command.options.cooldownLimit!,
                            this.command.options.cooldownDelay! / Time.Second,
                            cleanRound(
                                (this.error.context as {
                                    remaining: number,
                                }).remaining,
                            ) / Time.Second,
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

                //TODO: Support client/user local/global permissions
                //No default
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