import { ContextMenuInteraction, Message, type CommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';
import { i18n } from '../locales/i18n';
import { Log } from '../structures/Log';
import { slashCommandResolver } from '../utility/utility';

export class BasePrecondition extends Precondition {
    public override async chatInputRun(interaction: CommandInteraction) {
        Log.command(
            interaction,
            slashCommandResolver(interaction),
        );

        return this.interaction(interaction);
    }

    public override async contextMenuRun(interaction: ContextMenuInteraction) {
        return this.interaction(interaction);
    }

    public override async messageRun(message: Message) {
        Object.defineProperty(
            message,
            'i18n',
            {
                value: new i18n(),
            },
        );

        return this.ok();
    }

    private async interaction(action: CommandInteraction | ContextMenuInteraction) {
        Object.defineProperty(
            action,
            'i18n',
            {
                value: new i18n(action.locale),
            },
        );

        await action.deferReply({
            ephemeral: true,
        });

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

    interface Message {
        i18n: i18n,
    }
}