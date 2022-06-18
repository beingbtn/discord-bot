import { type CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';
import { Identifiers } from '../enums/Preconditions';

const developers = JSON.parse(process.env.OWNERS!) as string[];

export class DevModePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.checkDeveloper(interaction.user.id);
    }

    private checkDeveloper(userId: string) {
        return this.container.config.devMode === false
        || developers.includes(userId)
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