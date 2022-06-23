import { Interaction } from 'discord.js';
import { container, LogLevel } from '@sapphire/framework';

export class Log {
    static command(interaction: Interaction, ...text: unknown[]) {
        container.logger.info(
            container.i18n.getMessage(
                'logCommand', [
                    interaction.id,
                    interaction.user.id,
                ],
            ),
            ...text,
        );
    }

    static core(level: LogLevel, ...text: unknown[]) {
        container.logger.write(
            level,
            container.i18n.getMessage('logCore'),
            ...text,
        );
    }

    static request(level: LogLevel, ...text: unknown[]) {
        container.logger.write(
            level,
            container.i18n.getMessage('logRequest'),
            ...text,
        );
    }
}