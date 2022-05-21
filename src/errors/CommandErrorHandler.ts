import type { WebhookConfig } from '../@types/client';
import { BaseInteractionErrorHandler } from './BaseCommandErrorHandler';
import {
    MessageComponentInteraction,
    MessageEmbed,
} from 'discord.js';
import { constants } from '../utility/constants';
import { ErrorHandler } from './ErrorHandler';
import { sendWebHook } from '../utility/utility';
import process from 'node:process';

const fatalWebhook = JSON.parse(process.env.WEBHOOK_FATAL!) as WebhookConfig;
const owners = JSON.parse(process.env.OWNERS!) as string[];

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
            await handler.systemNotify();
            await handler.userNotify();
        } catch (error2) {
            await ErrorHandler.init(error2, handler.incidentID);
        }
    }

    private errorLog() {
        this.log(this.error);
    }

    private async userNotify() {
        const embed = new MessageEmbed()
            .setColor(constants.colors.error)
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

            const failedEmbed = this
                .errorEmbed()
                .setDescription(message);

            await sendWebHook({
                content: `<@${owners.join('><@')}>`,
                embeds: [failedEmbed],
                files: [this.stackAttachment],
                webhook: fatalWebhook,
                suppressError: true,
            });
        }
    }

    private async systemNotify() {
        const embeds = [this.interactionErrorEmbed(), this.errorEmbed()];

        embeds[0].setTitle(this.i18n.getMessage('errorsGeneralUnexpected'));

        await sendWebHook({
            content: `<@${owners.join('><@')}>`,
            embeds: embeds,
            files: [this.stackAttachment],
            webhook: fatalWebhook,
            suppressError: true,
        });
    }
}