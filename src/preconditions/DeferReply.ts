import type { CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';

//Hack to add i18n to all interactions
export class i18nPrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.i18n(interaction);
    }

    private async i18n(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        this.container.logger.debug('deferred');
        return this.ok();
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        DeferReply: never;
    }
}