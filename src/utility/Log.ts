import { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import { formattedUnix } from './utility';

export class Log {
    private static base(type: string) {
        const time = formattedUnix({ date: true, utc: true });
        return `${time} [${type}]`;
    }

    static core(...text: unknown[]) {
        container.logger.info(
            this.base(
                container.i18n.getMessage('logCore'),
            ),
            ...text,
        );
    }

    static interaction(interaction: CommandInteraction, ...text: unknown[]) {
        container.logger.info(
            this.base(
                container.i18n.getMessage('logInteraction'),
            ),
            interaction.id,
            interaction.user.id,
            ...text,
        );
    }

    static request(...text: unknown[]) {
        container.logger.warn(
            this.base(
                container.i18n.getMessage('logRequest'),
            ),
            ...text,
        );
    }
}