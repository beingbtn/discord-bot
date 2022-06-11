import { type CustomID } from '../../@types/Persistent';
import { Events } from '../../enums/Events';
import { InteractionErrorHandler } from '../../errors/InteractionErrorHandler';
import { Listener } from '@sapphire/framework';
import {
    type MessageComponentInteraction,
    MessageEmbed,
} from 'discord.js';
import { Options } from '../../utility/Options';

export class PersistentNotificationListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.PersistentNotification,
        });
    }

    public async run(
        interaction: MessageComponentInteraction<'cached'>,
        customID: CustomID,
    ) {
        try {
            const category = customID.value;

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
                .setColor(Options.colorsNormal);

            if (hasRole === true) {
                await memberRoles.remove(announcement.role);

                notificationsEmbed
                    .setTitle(
                        interaction.i18n.getMessage(
                            'persistentNotificationRemoveTitle', [
                                category,
                            ],
                        ),
                    )
                    .setDescription(
                        interaction.i18n.getMessage(
                            'persistentNotificationRemoveDescription', [
                                category,
                            ],
                        ),
                    );
            } else {
                await memberRoles.add(announcement.role);

                notificationsEmbed
                    .setTitle(
                        interaction.i18n.getMessage(
                            'persistentNotificationAddTitle', [
                                category,
                            ],
                        ),
                    )
                    .setDescription(
                        interaction.i18n.getMessage(
                            'persistentNotificationAddDescription', [
                                category,
                            ],
                        ),
                    );
            }

            await interaction.member.fetch();

            notificationsEmbed
                .addFields([{
                    name: interaction.i18n.getMessage('persistentNotificationCurrentName'),
                    value: Object.entries(announcements).filter(
                        ([, value]) => memberRoles.cache.has(value.role),
                    ).map(([key]) => key).join(', ') ||
                        interaction.i18n.getMessage('none'),
                }]);

            await interaction.reply({
                embeds: [notificationsEmbed],
                ephemeral: true,
            });
        } catch (error) {
            await InteractionErrorHandler.init(error, interaction);
        }
    }
}