import { CommandInteraction } from 'discord.js';
import { formattedUnix } from './utility';

export class Log {
    private static base(type: string) {
        const time = formattedUnix({ date: true, utc: true });
        return `${time} [${type}]`;
    }

    static error(...text: unknown[]) {
        console.error(this.base('ERROR'), ...text);
    }

    static interaction(interaction: CommandInteraction, ...text: unknown[]) {
        console.log(this.base('INTERACTION'), interaction.id, interaction.user.id, ...text);
    }

    static log(...text: unknown[]) {
        console.log(this.base('LOG'), ...text);
    }

    static request(...text: unknown[]) {
        console.log(this.base('REQUEST'), ...text);
    }
}