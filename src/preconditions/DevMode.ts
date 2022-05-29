import type { CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';

const developers = JSON.parse(process.env.OWNERS!) as string[];

export class DevModePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.checkDeveloper(interaction.user.id);
    }

    private checkDeveloper(userId: string) {
        return developers.includes(userId)
            ? this.ok()
            : this.error({ message: 'Only the bot owner can use this command!' });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        DevMode: never;
    }
}