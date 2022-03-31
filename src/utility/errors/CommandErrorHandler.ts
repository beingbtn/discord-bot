import type { WebhookConfig } from '../../@types/client';
import { BaseCommandErrorHandler } from './BaseCommandErrorHandler';
import {
    CommandInteraction,
    MessageEmbed,
} from 'discord.js';
import { Constants } from '../Constants';
import { ErrorHandler } from '../../utility/errors/ErrorHandler';
import { RegionLocales } from '../../locales/RegionLocales';
import { sendWebHook } from '../../utility/utility';

const fatalWebhook = JSON.parse(process.env.WEBHOOK_FATAL!) as WebhookConfig;
const owners = JSON.parse(process.env.OWNERS!) as string[];

export class CommandErrorHandler<E> extends BaseCommandErrorHandler<E> {
    readonly interaction: CommandInteraction;
    readonly locale: string;

    constructor(
        error: E,
        interaction: CommandInteraction,
        locale: string,
    ) {
        super(error, interaction);
        this.interaction = interaction;
        this.locale = locale;
    }

    static async init<T>(
        error: T,
        interaction: CommandInteraction,
        locale: string,
    ) {
        const handler = new CommandErrorHandler(error, interaction, locale);

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
        const { commandName } = this.interaction;

        const text = RegionLocales
            .locale(this.locale)
            .errors;

        const { replace } = RegionLocales;

        const embed = new MessageEmbed()
            .setColor(Constants.colors.error)
            .setTitle(text.commandErrors.embed.title)
            .setDescription(replace(text.commandErrors.embed.description, {
                commandName: commandName,
            }))
            .addFields({
                name: text.commandErrors.embed.field.name,
                value: replace(text.commandErrors.embed.field.value, {
                    id: this.incidentID,
                }),
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
            const message = 'An error has occurred and also failed to notify the user';

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
        const embeds = [this.getGuildInformation(), this.errorEmbed()];

        embeds[0].setTitle('Unexpected Error');

        await sendWebHook({
            content: `<@${owners.join('><@')}>`,
            embeds: embeds,
            files: [this.stackAttachment],
            webhook: fatalWebhook,
            suppressError: true,
        });
    }
}