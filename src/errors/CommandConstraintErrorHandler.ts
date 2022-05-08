import type { WebhookConfig } from '../@types/client';
import { BaseInteractionErrorHandler } from './BaseCommandErrorHandler';
import {
    BetterEmbed,
    cleanRound,
    sendWebHook,
} from '../utility/utility';
import {
    ColorResolvable,
    CommandInteraction,
} from 'discord.js';
import { Constants } from '../utility/Constants';
import { ConstraintError } from './ConstraintError';
import { ErrorHandler } from './ErrorHandler';
import { setTimeout } from 'node:timers/promises';
import process from 'node:process';

export class CommandConstraintErrorHandler
    extends BaseInteractionErrorHandler<ConstraintError> {
    readonly interaction: CommandInteraction;

    constructor(
        error: ConstraintError,
        interaction: CommandInteraction,
    ) {
        super(error, interaction);
        this.interaction = interaction;
    }

    static async init(
        error: ConstraintError,
        interaction: CommandInteraction,
    ) {
        const handler =
            new CommandConstraintErrorHandler(error, interaction);

        try {
            handler.errorLog();
            await handler.systemNotify();
            await handler.userNotify();
        } catch (error2) {
            await ErrorHandler.init(error2, handler.incidentID);
        }
    }

    private errorLog() {
        this.log(`${this.interaction.user.id} failed the constraint ${this.error.message}`);
    }

    private async userNotify() {
        const { commandName } = this.interaction;

        switch (this.error.message) {
            case 'devMode': await this.constraintResolver(
                this.i18n.getMessage(
                    'errorsInteractionConstraintDevModeTitle',
                ),
                this.i18n.getMessage(
                    'errorsInteractionConstraintDevModeDescription',
                ),
            );
            break;
            case 'owner': await this.constraintResolver(
                this.i18n.getMessage(
                    'errorsInteractionConstraintOwnerTitle',
                ),
                this.i18n.getMessage(
                    'errorsInteractionConstraintOwnerDescription',
                ),
            );
            break;
            case 'dm': await this.constraintResolver(
                this.i18n.getMessage(
                    'errorsInteractionConstraintDMTitle',
                ),
                this.i18n.getMessage(
                    'errorsInteractionConstraintDMDescription',
                ),
            );
            break;
            case 'cooldown': {
                const command = this.interaction.client.commands.get(
                    commandName,
                );

                await this.constraintResolver(
                    this.i18n.getMessage(
                        'errorsInteractionConstraintCooldownWaitingTitle',
                    ),
                    this.i18n.getMessage(
                        'errorsInteractionConstraintCooldownWaitingDescription', [
                            (command?.properties.cooldown ?? 0) /
                                Constants.ms.second,
                            cleanRound(
                                this.error.cooldown! /
                                    Constants.ms.second,
                                1,
                            ),
                        ],
                    ),
                );

                await setTimeout(this.error.cooldown!);

                await this.constraintResolver(
                    this.i18n.getMessage(
                        'errorsInteractionConstraintCooldownCooldownOverTitle',
                    ),
                    this.i18n.getMessage(
                        'errorsInteractionConstraintCooldownCooldownOverDescription', [
                        commandName,
                    ]),
                    Constants.colors.on,
                );
            }
            break;
            //No default
        }
    }

    private async constraintResolver(
        title: string,
        description: string,
        color?: ColorResolvable,
    ) {
        const embed = new BetterEmbed(this.interaction)
            .setColor(color ?? Constants.colors.warning)
            .setTitle(title)
            .setDescription(description);

        await this.interaction.editReply({
            embeds: [embed],
        });
    }

    private async systemNotify() {
        const embeds = [this.interactionErrorEmbed()];

        embeds[0]
            .setTitle('User Failed Constraint')
            .setDescription(`Constraint: ${this.error.message}`);

        await sendWebHook({
            embeds: embeds,
            webhook: JSON.parse(
                process.env.WEBHOOK_NON_FATAL!,
            ) as WebhookConfig,
            suppressError: true,
        });
    }
}