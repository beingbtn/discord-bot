import {
    Events,
    Listener,
} from '@sapphire/framework';
import {
    type Interaction,
    MessageFlags,
} from 'discord.js';
import { type CustomID } from '../@types/Persistent';
import { ErrorHandler } from '../errors/ErrorHandler';
import { i18n } from '../locales/i18n';

export class ComponentInteractionCreateListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.InteractionCreate,
        });
    }

    public run(interaction: Interaction) {
        try {
            if (
                interaction.isMessageComponent()
                && interaction.inCachedGuild()
                && interaction.message.flags.has(MessageFlags.FLAGS.EPHEMERAL) === false
                && interaction.message.type === 'DEFAULT'
            ) {
                this.container.logger.info(
                    `${this.constructor.name}:`,
                    `Received a MessageComponentInteraction from ${interaction.user.id}.`,
                    `CustomID reads ${interaction.customId}.`,
                );

                Object.defineProperty(
                    interaction,
                    'i18n',
                    {
                        value: new i18n(interaction.locale),
                    },
                );

                const customID = JSON.parse(interaction.customId) as CustomID;

                this.container.client.emit(
                    customID.event,
                    interaction,
                    customID,
                );
            }
        } catch (error) {
            new ErrorHandler(error).init();
        }
    }
}