import type {
    ClientEvent,
} from '../@types/client';
import {
    ButtonInteraction,
} from 'discord.js';
import { CommandErrorHandler } from '../utility/errors/CommandErrorHandler';
import { i18n } from '../locales/i18n';

export const properties: ClientEvent['properties'] = {
    name: 'interactionCreate',
    once: false,
};

export const execute: ClientEvent['execute'] = async (
    interaction: ButtonInteraction,
): Promise<void> => {
    try {
        if (interaction.isButton()) {
            interaction.i18n = new i18n(interaction.locale);

            await interaction.reply('hi');
        }
    } catch (error) {
        await CommandErrorHandler.init(
            error,
            interaction,
            interaction.locale,
        );
    }
};