import { Listener } from '@sapphire/framework';
import {
    type MessageComponentInteraction,
    MessageEmbed,
} from 'discord.js';
import { type CustomID } from '../../@types/Persistent';
import { Events } from '../../enums/Events';
import { InteractionErrorHandler } from '../../errors/InteractionErrorHandler';
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

            const { role } = this.container.announcements.find(
                (announcement) => announcement.category === category,
            )!;

            const memberRoles = interaction.member.roles;
            const hasRole = memberRoles.cache.has(role);

            const notificationsEmbed = new MessageEmbed()
                .setColor(Options.colorsNormal);

            if (hasRole === true) {
                await memberRoles.remove(role);

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
                await memberRoles.add(role);

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
                    value: this.container.announcements.filter(
                        (announcement) => memberRoles.cache.has(announcement.role),
                    ).map(
                        (announcement) => announcement.category,
                    ).join(', ')
                        || interaction.i18n.getMessage('none'),
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