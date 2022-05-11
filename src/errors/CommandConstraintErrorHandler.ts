import type { WebhookConfig } from '../@types/client';
import { BaseInteractionErrorHandler } from './BaseCommandErrorHandler';
import {
    BetterEmbed,
    sendWebHook,
} from '../utility/utility';
import {
    ColorResolvable,
    CommandInteraction,
} from 'discord.js';
import { Constants } from '../utility/Constants';
import { ConstraintError } from './ConstraintError';
import { ErrorHandler } from './ErrorHandler';
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
        } catch (error2) {
            await ErrorHandler.init(error2, handler.incidentID);
        }
    }

    static async resolveConstraint(
        interaction: CommandInteraction,
        title: string,
        description: string,
        color?: ColorResolvable,
    ) {
        const embed = new BetterEmbed(interaction)
            .setColor(color ?? Constants.colors.warning)
            .setTitle(title)
            .setDescription(description);

        await interaction.editReply({
            embeds: [embed],
        });
    }

    private errorLog() {
        this.log(`${this.interaction.user.id} failed the constraint ${this.error.message}`);
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