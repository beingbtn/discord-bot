import { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

export class Log {
    static command(interaction: CommandInteraction, ...text: unknown[]) {
        container.logger.info(
            container.i18n.getMessage('logCommand', [
                interaction.id,
                interaction.user.id,
            ]),
            ...text,
        );
    }

    static core(...text: unknown[]) {
        container.logger.info(
            container.i18n.getMessage('logCore'),
            ...text,
        );
    }

    static request(...text: unknown[]) {
        container.logger.warn(
            container.i18n.getMessage('logRequest'),
            ...text,
        );
    }
}