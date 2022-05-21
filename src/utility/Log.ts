import { CommandInteraction } from 'discord.js';
import { client } from '../main';
import { formattedUnix } from './utility';

export class Log {
    private static base(type: string) {
        const time = formattedUnix({ date: true, utc: true });
        return `${time} [${type}]`;
    }

    static error(...text: unknown[]) {
        console.error(
            this.base(
                client.i18n.getMessage('logError'),
            ),
            ...text,
        );
    }

    static interaction(interaction: CommandInteraction, ...text: unknown[]) {
        console.log(
            this.base(
                client.i18n.getMessage('logInteraction'),
            ),
            interaction.id,
            interaction.user.id,
            ...text,
        );
    }

    static log(...text: unknown[]) {
        console.log(
            this.base(
                client.i18n.getMessage('logLog'),
            ),
            ...text,
        );
    }

    static request(...text: unknown[]) {
        console.log(
            this.base(
                client.i18n.getMessage('logRequest'),
            ),
            ...text,
        );
    }
}