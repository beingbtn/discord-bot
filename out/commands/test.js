"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.properties = void 0;
exports.properties = {
    name: 'test',
    description: 'Does stuff.',
    cooldown: 0,
    ephemeral: true,
    noDM: false,
    ownerOnly: true,
    structure: {
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
                                description: 'A command to get info about. This parameter is completely optional',
                                required: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
};
/* eslint-disable no-await-in-loop */
const execute = async (interaction) => {
    await interaction.followUp({ content: 'e' });
    throw new TypeError();
};
exports.execute = execute;
