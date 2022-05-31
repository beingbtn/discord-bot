import type { CommandInteraction } from 'discord.js';
import { container, Precondition } from '@sapphire/framework';
import { Preconditions as PreconditionsEnum } from '../enums/Preconditions';

const developers = JSON.parse(process.env.OWNERS!) as string[];

export class DevModePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.checkDeveloper(interaction.user.id);
    }

    private checkDeveloper(userId: string) {
        return container.config.devMode === false ||
            developers.includes(userId)
                ? this.ok()
                : this.error({
                    identifier: PreconditionsEnum.DevMode,
                });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        DevMode: never;
    }
}