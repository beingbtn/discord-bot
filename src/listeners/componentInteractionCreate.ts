import { type CustomID } from '../@types/Persistent';
import { Events } from '../enums/Events';
import {
    type Interaction,
    MessageFlags,
} from 'discord.js';
import { Listener } from '@sapphire/framework';

export class ComponentInteractionCreateListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.InteractionCreate,
        });
    }

    public run(interaction: Interaction) {
        if (
            interaction.isMessageComponent() &&
            interaction.inCachedGuild() &&
            interaction.message.flags.has(MessageFlags.FLAGS.EPHEMERAL) === false &&
            interaction.message.type === 'DEFAULT' //test
        ) {
            const customID = JSON.parse(interaction.customId) as CustomID;

            this.container.client.emit(
                customID.event,
                interaction,
                customID,
            );
        }
    }
}