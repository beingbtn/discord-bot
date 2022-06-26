import { Precondition } from '@sapphire/framework';
import {
    ContextMenuInteraction,
    type CommandInteraction,
} from 'discord.js';
import { Identifiers } from '../enums/Identifiers';

export class DevModePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.checkOwner(interaction.user.id);
    }

    public override contextMenuRun(interaction: ContextMenuInteraction) {
        return this.checkOwner(interaction.user.id);
    }

    private checkOwner(userId: string) {
        return this.container.config.owners.includes(userId)
            ? this.ok()
            : this.error({
                identifier: Identifiers.OwnerOnly,
            });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        OwnerOnly: never;
    }
}