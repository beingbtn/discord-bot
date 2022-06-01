import type { Interaction } from 'discord.js';
import {
    Events,
    Listener,
} from '@sapphire/framework';

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
            interaction.message.flags.has('EPHEMERAL') === false &&
            interaction.message.type === 'DEFAULT' //test
        ) {
            
        }
    }
}