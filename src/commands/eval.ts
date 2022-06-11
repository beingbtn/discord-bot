import {
    type ApplicationCommandRegistry,
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { BetterEmbed } from '../structures/BetterEmbed';
import {
    type CommandInteraction,
    Formatters,
} from 'discord.js';
import { Limits } from '../enums/Limits';
import { Log } from '../structures/Log';
import { Options } from '../utility/Options';
import { Preconditions } from '../enums/Preconditions';

export class EvalCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'eval',
            description: 'Evaluates a string',
            cooldownLimit: 0,
            cooldownDelay: 0,
            cooldownScope: BucketScope.User,
            preconditions: [
                Preconditions.Base,
                Preconditions.DevMode,
                Preconditions.OwnerOnly,
            ],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
        });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
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
        }, {
            guildIds: this.options.preconditions?.find(
                    condition => condition === Preconditions.OwnerOnly,
                )
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
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
                output?.length >= Limits.EmbedField
            );

            evalEmbed.setColor(Options.colorsNormal).addFields(
                {
                    name: i18n.getMessage('commandsEvalOutputName'),
                    value: Formatters.codeBlock(
                        'javascript',
                        output?.toString()?.slice(
                            0,
                            Limits.EmbedField,
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
                        i18n.getMessage(
                            'commandsEvalTimeTakenValue', [
                                timeTaken,
                            ],
                        ),
                    ),
                },
            );

            if (outputMaxLength === true) {
                evalEmbed.addFields({
                    name: i18n.getMessage('commandsEvalMaxLengthName'),
                    value: i18n.getMessage('commandsEvalMaxLengthValue'),
                });
            }

            Log.command(
                interaction,
                'Output: ',
                output,
            );

            await interaction.editReply({ embeds: [evalEmbed] });
        } catch (error) {
            const end = Date.now();
            const timeTaken = end - start;

            const outputMaxLength = Boolean(
                (error as Error).message.length >= Limits.EmbedField,
            );

            evalEmbed.setColor(Options.colorsNormal).addFields(
                {
                    name: i18n.getMessage('commandsEvalTimeTakenName'),
                    value: Formatters.codeBlock(
                        i18n.getMessage(
                            'commandsEvalTimeTakenValue', [
                                timeTaken,
                            ],
                        ),
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