import type { CommandStatic } from '../@types/Command';
import { BetterEmbed } from '../utility/BetterEmbed';
import { Constants } from '../utility/Constants';
import {
    CommandInteraction,
    Formatters,
} from 'discord.js';
import { Log } from '../utility/Log';
import { Options } from '../utility/Options';

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
        name: 'eval',
        description: 'Evaluates a string',
        options: [
            {
                name: 'string',
                type: 3,
                description: 'Code',
                required: true,
            },
        ],
    };

    static async execute(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const input = interaction.options.getString('string', true);

        const evalEmbed = new BetterEmbed(interaction).addFields({
            name: i18n.getMessage('commandsEvalInputName'),
            value: Formatters.codeBlock('javascript', input),
        });

        const start = Date.now();

        try {
            const output = await eval(input); //eslint-disable-line no-eval
            const end = Date.now();
            const timeTaken = end - start;
            const outputMaxLength = (
                output?.length >= Constants.limitEmbedField
            );

            evalEmbed.setColor(Options.colorsNormal).addFields(
                {
                    name: i18n.getMessage('commandsEvalOutputName'),
                    value: Formatters.codeBlock(
                        'javascript',
                        output?.toString()?.slice(
                            0,
                            Constants.limitEmbedField,
                        ),
                    ),
                },
                {
                    name: i18n.getMessage('commandsEvalTypeName'),
                    value: Formatters.codeBlock(typeof output),
                },
                {
                    name: i18n.getMessage('commandsEvalTimeTakenName'),
                    value: Formatters.codeBlock(
                        i18n.getMessage('commandsEvalTimeTakenValue', [timeTaken]),
                    ),
                },
            );

            if (outputMaxLength === true) {
                evalEmbed.addFields({
                    name: i18n.getMessage('commandsEvalMaxLengthName'),
                    value: i18n.getMessage('commandsEvalMaxLengthValue'),
                });
            }

            Log.interaction(interaction, 'Output: ', output);

            await interaction.editReply({ embeds: [evalEmbed] });
        } catch (error) {
            const end = Date.now();
            const timeTaken = end - start;

            const outputMaxLength = Boolean(
                (error as Error).message.length >= Constants.limitEmbedField,
            );

            evalEmbed.setColor(Options.colorsNormal).addFields(
                {
                    name: i18n.getMessage('commandsEvalTimeTakenName'),
                    value: Formatters.codeBlock(
                        i18n.getMessage('commandsEvalTimeTakenValue', [
                            timeTaken,
                        ]),
                    ),
                },
            );

            if (outputMaxLength === true) {
                evalEmbed.addFields({
                    name: i18n.getMessage('commandsEvalMaxLengthName'),
                    value: i18n.getMessage('commandsEvalMaxLengthValue'),
                });
            }

            const errorStackAttachment = {
                attachment: Buffer.from(
                    JSON.stringify(
                        error,
                        Object.getOwnPropertyNames(error),
                        4,
                    ),
                ),
                name: error instanceof Error
                    ? `${error.name}.txt`
                    : 'error.txt',
            };

            await interaction.editReply({
                embeds: [evalEmbed],
                files: [errorStackAttachment],
            });
        }
    }
}