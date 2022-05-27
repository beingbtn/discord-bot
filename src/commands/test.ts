import type { CommandInteraction } from 'discord.js';
import type { CommandStatic } from '../@types/Command';

export default class implements CommandStatic {
    static cooldown = 0;
    static ephemeral = true;
    static noDM = false;
    static ownerOnly = true;
    static permissions = {
        bot: {
            global: [],
            local: [],
        },
        user: {
            global: [],
            local: [],
        },
    };
    static structure = {
        name: 'test',
        description: 'Does stuff',
        options: [
            {
                name: 'delete',
                type: 2,
                description: 'Delete all of your data',
                options: [
                    {
                        name: 'view',
                        description: 'Returns a file with all of your data',
                        type: 1,
                        options: [
                            {
                                name: 'command',
                                type: 3,
                                description:
                                    'A command to get info about. This parameter is completely optional',
                                required: false,
                            },
                        ],
                    },
                ],
            },
        ],
    };

    static async execute(interaction: CommandInteraction) {
        await interaction.followUp({ content: 'e' });
        throw new TypeError();
    }
}