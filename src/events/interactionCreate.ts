import type { ClientCommand } from '../@types/Module';
import type { EventStatic } from '../@types/Event';
import {
    CommandInteraction,
    MessageComponentInteraction,
    MessageEmbed,
} from 'discord.js';
import { client } from '../main';
import { CommandConstraintErrorHandler } from '../errors/CommandInteractionConstraintErrorHandler';
import { constants } from '../utility/constants';
import { ConstraintError } from '../errors/ConstraintError';
import {
    devModeConstraint,
    ownerConstraint,
    userPermissionsConstraint,
    botPermissionsConstraint,
    dmConstraint,
    cooldownConstraint,
} from '../utility/constraints';
import { InteractionErrorHandler } from '../errors/InteractionErrorHandler';
import { i18n } from '../locales/i18n';
import { Log } from '../utility/Log';
import { slashCommandResolver } from '../utility/utility';
import process from 'node:process';

export class Event implements EventStatic {
    static event = 'interactionCreate';
    static once = false;

    static async execute(interaction: MessageComponentInteraction) {
        try {
            interaction.i18n = new i18n(interaction.locale);

            if (interaction.isCommand()) {
                const command: ClientCommand | undefined =
                    client.commands.get(interaction.commandName);

                if (typeof command === 'undefined') {
                    return;
                }

                Log.interaction(interaction, slashCommandResolver(interaction));

                await interaction.deferReply({
                    ephemeral: command.properties.ephemeral &&
                        interaction.inGuild(),
                });

                await devModeConstraint(interaction);
                await ownerConstraint(interaction, command);
                await userPermissionsConstraint(interaction, command);
                await botPermissionsConstraint(interaction, command);
                await dmConstraint(interaction, command);
                await cooldownConstraint(interaction, command);

                await command.execute(
                    interaction,
                );
            } else if (
                interaction.isButton() &&
                interaction.inCachedGuild() &&
                interaction.message.flags.has('EPHEMERAL') === false
            ) {
                //Handling for notifications
                //Move to a "persistent" folder or something

                const category = interaction.customId;

                const announcements = JSON.parse(
                    process.env.ANNOUNCEMENTS!,
                ) as {
                    [key: string]: {
                        id: string,
                        role: string,
                    }
                };

                const announcement = announcements[category];
                const memberRoles = interaction.member.roles;
                const hasRole = memberRoles.cache.has(announcement.role);

                const notificationsEmbed = new MessageEmbed()
                    .setColor(constants.colors.normal);

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
                new CommandConstraintErrorHandler(
                    error,
                    interaction,
                ).init();
            } else {
                await InteractionErrorHandler.init(
                    error,
                    interaction,
                );
            }
        }
    }
}