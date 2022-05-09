import type {
    ClientCommand,
    ClientEvent,
} from '../@types/client';
import {
    Collection,
    CommandInteraction,
    MessageComponentInteraction,
    MessageEmbed,
} from 'discord.js';
import { CommandConstraintErrorHandler } from '../errors/CommandConstraintErrorHandler';
import { InteractionErrorHandler } from '../errors/CommandErrorHandler';
import { Constants } from '../utility/Constants';
import { ConstraintError } from '../errors/ConstraintError';
import { i18n } from '../locales/i18n';
import { Log } from '../utility/Log';
import { slashCommandResolver } from '../utility/utility';
import process from 'node:process';

const owners = JSON.parse(process.env.OWNERS!) as string[];

export const properties: ClientEvent['properties'] = {
    name: 'interactionCreate',
    once: false,
};

export const execute: ClientEvent['execute'] = async (
    interaction: MessageComponentInteraction,
): Promise<void> => {
    try {
        interaction.i18n = new i18n(interaction.locale);

        if (interaction.isCommand()) {
            const command: ClientCommand | undefined =
                interaction.client.commands.get(interaction.commandName);

            if (typeof command === 'undefined') {
                return;
            }

            Log.interaction(interaction, slashCommandResolver(interaction));

            await interaction.deferReply({
                ephemeral: command.properties.ephemeral &&
                    interaction.inGuild(),
            });

            devModeConstraint(interaction);
            ownerConstraint(interaction, command);
            dmConstraint(interaction, command);
            cooldownConstraint(interaction, command);

            await command.execute(
                interaction,
            );
        } else if (interaction.isButton() && interaction.inCachedGuild()) {
            //Handling for notifications

            const category = interaction.customId;

            const announcements = JSON.parse(process.env.ANNOUNCEMENTS!) as {
                [key: string]: {
                    id: string,
                    role: string,
                }
            };

            const announcement = announcements[category];
            const memberRoles = interaction.member.roles;
            const hasRole = memberRoles.cache.has(announcement.role);

            const notificationsEmbed = new MessageEmbed()
                .setColor(Constants.colors.normal);

            if (hasRole) {
                await memberRoles.remove(announcement.role);

                notificationsEmbed
                    .setTitle(interaction.i18n.getMessage(
                        'notificationsRemoveTitle', [
                        category,
                    ]))
                    .setDescription(interaction.i18n.getMessage(
                        'notificationsRemoveDescription', [
                        category,
                    ]));
            } else {
                await memberRoles.add(announcement.role);

                notificationsEmbed
                    .setTitle(interaction.i18n.getMessage(
                        'notificationsAddTitle', [
                        category,
                    ]))
                    .setDescription(interaction.i18n.getMessage(
                        'notificationsAddDescription', [
                        category,
                    ]));
            }

            await interaction.member.fetch();

            notificationsEmbed
                .addFields([{
                    name: interaction.i18n.getMessage('notificationsCurrentName'),
                    value: Object.entries(announcements).filter(
                            ([, value]) => memberRoles.cache.has(value.role),
                        ).map(([key]) => key).join(', ') ||
                    interaction.i18n.getMessage('none'),
                }]);

            await interaction.reply({
                embeds: [notificationsEmbed],
                ephemeral: true,
            });
        }
    } catch (error) {
        if (
            interaction instanceof CommandInteraction &&
            error instanceof ConstraintError
        ) {
            await CommandConstraintErrorHandler.init(
                error,
                interaction,
            );
        } else {
            await InteractionErrorHandler.init(
                error,
                interaction,
            );
        }
    }
};

function devModeConstraint(
    interaction: CommandInteraction,
) {
    const { devMode } = interaction.client.config;

    if (
        devMode === true &&
        owners.includes(interaction.user.id) === false
    ) {
        throw new ConstraintError('devMode');
    }
}

function ownerConstraint(
    interaction: CommandInteraction,
    command: ClientCommand,
) {
    const { ownerOnly } = command.properties;

    if (
        ownerOnly === true &&
        owners.includes(interaction.user.id) === false
    ) {
        throw new ConstraintError('owner');
    }
}

function dmConstraint(
    interaction: CommandInteraction,
    command: ClientCommand,
) {
    const { noDM } = command.properties;

    if (
        noDM === true &&
        !interaction.inCachedGuild()
    ) {
        throw new ConstraintError('dm');
    }
}

function cooldownConstraint(
    interaction: CommandInteraction,
    command: ClientCommand,
) {
    const { client: { cooldowns }, user } = interaction;
    const { name, cooldown } = command.properties;

    const timestamps = cooldowns.get(name);

    if (typeof timestamps === 'undefined') {
        cooldowns.set(name, new Collection());
        cooldowns.get(name)!.set(user.id, Date.now());
        return;
    }

    const expireTime = Number(timestamps.get(user.id)) + cooldown;
    const isCooldown = expireTime > (Constants.ms.second * 2.5) + Date.now();
    const timeLeft = expireTime - Date.now();

    if (isCooldown === true) {
        throw new ConstraintError('cooldown', timeLeft);
    }

    timestamps.set(user.id, Date.now());
}