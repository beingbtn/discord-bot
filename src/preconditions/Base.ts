import { type CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';
import { i18n } from '../locales/i18n';
import { Log } from '../structures/Log';
import { slashCommandResolver } from '../utility/utility';

export class BasePrecondition extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return this.base(interaction);
    }

    private async base(interaction: CommandInteraction) {
        Object.defineProperty(
            interaction,
            'i18n',
            {
                value: new i18n(interaction.locale),
            },
        );

        await interaction.deferReply({
            ephemeral: true,
        });

        Log.command(
            interaction,
            slashCommandResolver(interaction),
        );

        return this.ok();
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        Base: never;
    }
}

declare module 'discord.js' {
    interface Interaction {
        i18n: i18n,
    }
}