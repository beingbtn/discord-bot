import { BetterEmbed } from '../structures/BetterEmbed';
import { cleanLength } from '../utility/utility';
import {
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { Limits } from '../enums/Limits';
import { Log } from '../structures/Log';
import { Options } from '../utility/Options';

type errorTypes =
    | 'abort'
    | 'generic'
    | 'http';

type TimeoutSettables =
    | 'timeout'
    | 'resumeAfter';

export class APICommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'test',
            description: 'Does stuff',
            cooldownLimit: 0,
            cooldownDelay: 0,
            cooldownScope: BucketScope.User,
            preconditions: [
                'Base',
                'DevMode',
                'OwnerOnly',
            ],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand({
            name: 'api',
            description: 'Toggles dynamic settings',
            options: [
                {
                    name: 'stats',
                    type: 1,
                    description: 'Returns some stats about the API Request Handler',
                },
                {
                    name: 'set',
                    type: 1,
                    description: 'Set data for the API Request Handler',
                    options: [
                        {
                            name: 'category',
                            type: 3,
                            description: 'The category to execute on',
                            required: true,
                            choices: [
                                {
                                    name: 'abort',
                                    value: 'abort',
                                },
                                {
                                    name: 'generic',
                                    value: 'generic',
                                },
                                {
                                    name: 'http',
                                    value: 'http',
                                },
                            ],
                        },
                        {
                            name: 'type',
                            type: 3,
                            description: 'The category to execute on',
                            required: true,
                            choices: [
                                {
                                    name: 'pauseFor',
                                    value: 'pauseFor',
                                },
                                {
                                    name: 'resumeAfter',
                                    value: 'resumeAfter',
                                },
                                {
                                    name: 'timeout',
                                    value: 'timeout',
                                },
                            ],
                        },
                        {
                            name: 'value',
                            type: 10,
                            description: 'An integer as an input',
                            required: true,
                            min_value: 0,
                        },
                    ],
                },
                {
                    name: 'call',
                    type: 1,
                    description: 'Call a function from the API Request Handler',
                    options: [
                        {
                            name: 'method',
                            type: 3,
                            description: 'The method to call',
                            required: true,
                            choices: [
                                {
                                    name: 'addAbort()',
                                    value: 'addAbort',
                                },
                                {
                                    name: 'addGeneric()',
                                    value: 'addGeneric',
                                },
                                {
                                    name: 'addHTTP()',
                                    value: 'addHTTP',
                                },
                            ],
                        },
                    ],
                },
            ],
        }, {
            guildIds: this.options.preconditions?.find(
                    condition => condition === 'OwnerOnly',
                )
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'stats': await this.stats(interaction);
                break;
            case 'set': await this.set(interaction);
                break;
            case 'call': await this.call(interaction);
                break;
            //no default
        }
    }

    public async stats(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const {
            abort,
            generic,
            http,
            getTimeout,
        } = this.container.core.errors;

        const { uses } = this.container.core;

        const statsEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setDescription(
                JSON.stringify(
                    this.container.core.performance,
                ).slice(0, Limits.EmbedDescription),
            )
            .addFields(
                {
                    name: i18n.getMessage('commandsAPIStatsEnabledName'),
                    value: i18n.getMessage(
                        this.container.config.core === true
                            ? 'yes'
                            : 'no',
                    ),
                },
                {
                    name: i18n.getMessage('commandsAPIStatsResumeName'),
                    value: getTimeout()
                        ? cleanLength(getTimeout())!
                        : i18n.getMessage('null'),
                },
                {
                    name: i18n.getMessage('commandsAPIStatsLastHourName'),
                    value: i18n.getMessage(
                        'commandsAPIStatsLastHourValue', [
                            abort.lastHour,
                            generic.lastHour,
                            http.lastHour,
                        ],
                    ),
                },
                {
                    name: i18n.getMessage('commandsAPIStatsNextTimeoutsName'),
                    value: i18n.getMessage(
                        'commandsAPIStatsNextTimeoutsValue', [
                            cleanLength(abort.timeout) ?? i18n.getMessage('null'),
                            cleanLength(generic.timeout) ?? i18n.getMessage('null'),
                            cleanLength(http.timeout) ?? i18n.getMessage('null'),
                        ],
                    ),
                },
                {
                    name: i18n.getMessage('commandsAPIStatsUsesName'),
                    value: String(uses),
                },
            );

        await interaction.editReply({
            embeds: [statsEmbed],
        });
    }

    public async set(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const category = interaction.options.getString('category', true) as errorTypes;
        const type = interaction.options.getString('type', true);
        const value = interaction.options.getNumber('value', true);

        this.container.core.errors[category][
            type as TimeoutSettables
        ] = value;
        const setEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsAPISetTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsAPISetDescription', [
                        category,
                        type,
                        value,
                    ],
                ),
            );

        Log.command(interaction, setEmbed.description);

        await interaction.editReply({
            embeds: [setEmbed],
        });
    }

    public async call(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;
        const method = interaction.options.getString('method', true);

        const hypixelModuleErrors = this.container.core.errors;

        if (
            method === 'addAbort' ||
            method === 'addGeneric' ||
            method === 'addHTTP'
        ) {
            hypixelModuleErrors[method]();
        }

        const callEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsAPICallTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsAPICallDescription', [
                        method,
                    ],
                ),
            );

        Log.command(interaction, callEmbed.description);

        await this.stats(interaction);
        await interaction.followUp({
            embeds: [callEmbed],
            ephemeral: true,
        });
    }
}