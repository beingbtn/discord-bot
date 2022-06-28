import { Command as SapphireCommand } from '@sapphire/framework';
import { Interaction } from 'discord.js';

export abstract class Command extends SapphireCommand {
    public logContext(interaction: Interaction) {
        return `Interaction ${interaction.id} User ${interaction.user.id}`;
    }
}

export namespace Command {
    export type Options = SapphireCommand.Options;
    export type Context = SapphireCommand.Context;
}