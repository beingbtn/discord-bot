import type { CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';
import { Preconditions as PreconditionsEnum } from '../enums/Preconditions';

const owners = JSON.parse(process.env.OWNERS!) as string[];

export class DevModePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.checkOwner(interaction.user.id);
    }

    private checkOwner(userId: string) {
        return owners.includes(userId)
            ? this.ok()
            : this.error({
                identifier: PreconditionsEnum.OwnerOnly,
            });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        OwnerOnly: never;
    }
}