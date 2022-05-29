import type { CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';
import { i18n } from '../locales/i18n';

//Hack to add i18n to all interactions

export class i18nPrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.i18n(interaction);
    }

    private i18n(interaction: CommandInteraction) {
        interaction.i18n = new i18n(interaction.locale);
        return this.ok();
    }
}

declare module 'discord.js' {
    interface Interaction {
        i18n: i18n,
    }
}