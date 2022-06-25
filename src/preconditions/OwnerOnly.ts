import { ContextMenuInteraction, Message, type CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';
import { Identifiers } from '../enums/Identifiers';

const owners = JSON.parse(process.env.OWNERS!) as string[];

export class DevModePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.checkOwner(interaction.user.id);
    }

    public override contextMenuRun(interaction: ContextMenuInteraction) {
        return this.checkOwner(interaction.user.id);
    }

    public override messageRun(message: Message) {
        return this.checkOwner(message.author.id);
    }

    private checkOwner(userId: string) {
        return owners.includes(userId)
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