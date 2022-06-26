import { Precondition } from '@sapphire/framework';
import {
    ContextMenuInteraction,
    type CommandInteraction,
} from 'discord.js';
import { Identifiers } from '../enums/Identifiers';

export class DevModePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.checkDeveloper(interaction.user.id);
    }

    public override contextMenuRun(interaction: ContextMenuInteraction) {
        return this.checkDeveloper(interaction.user.id);
    }

    private checkDeveloper(userId: string) {
        return this.container.config.devMode === false
        || this.container.config.owners.includes(userId)
            ? this.ok()
            : this.error({
                identifier: Identifiers.DevMode,
            });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        DevMode: never;
    }
}