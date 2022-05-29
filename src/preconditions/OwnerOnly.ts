import type { CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';

const owners = JSON.parse(process.env.OWNERS!) as string[];

export class DevModePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.checkOwner(interaction.user.id);
    }

    private checkOwner(userId: string) {
        return owners.includes(userId)
            ? this.ok()
            : this.error({ message: 'Only the bot owner can use this command!' });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        OwnerOnly: never;
    }
}