import { BetterEmbed } from '../utility/BetterEmbed';
import {
    BucketScope,
    Command,
    Listener,
    RegisterBehavior,
} from '@sapphire/framework';
import { Log } from '../utility/Log';
import { Options } from '../utility/Options';

export class TestCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'reload',
            description: 'Reloads all imports or a single import',
            cooldownLimit: 0,
            cooldownDelay: 0,
            cooldownScope: BucketScope.User,
            preconditions: [
                'Base',
                'OwnerOnly',
                'DevMode',
            ],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand({
            name: 'reload',
            description: 'Reloads all imports or a single import',
            options: [
                {
                    name: 'all',
                    type: 1,
                    description: 'Refreshes all imports',
                },
                {
                    name: 'single',
                    type: 1,
                    description: 'Refresh a single item',
                    options: [
                        {
                            name: 'type',
                            type: 3,
                            description: 'The category to refresh',
                            required: true,
                            choices: [
                                {
                                    name: 'commands',
                                    value: 'commands',
                                },
                                {
                                    name: 'listeners',
                                    value: 'listeners',
                                },
                            ],
                        },
                        {
                            name: 'item',
                            type: 3,
                            description: 'The item to refresh',
                            required: true,
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
            case 'all': await this.all(interaction);
                break;
            case 'single': await this.single(interaction);
                break;
            //no default
        }
    }

    private async all(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const now = Date.now();
        const promises: Promise<void>[] = [];

        for (const [, command] of this.container.stores.get('commands')) {
            promises.push(this.reloadItem(command));
        }

        for (const [, listener] of this.container.stores.get('listeners')) {
            promises.push(this.reloadItem(listener));
        }

        await Promise.all(promises);

        const reloadedEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(i18n.getMessage('commandsReloadAllTitle'))
            .setDescription(i18n.getMessage('commandsReloadAllDescription', [
                promises.length,
                Date.now() - now,
            ]));

        Log.command(
            interaction,
            `All imports have been reloaded after ${
                Date.now() - now
            } milliseconds.`,
        );

        await interaction.editReply({ embeds: [reloadedEmbed] });
    }

    private async single(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const now = Date.now();
        const typeName = interaction.options.getString('type', true);
        const type = this.container.stores.get(
            typeName as
                | 'commands'
                | 'listeners',
        );
        const item = interaction.options.getString('item')!;
        const selected = type.get(item);

        if (typeof selected === 'undefined') {
            const undefinedSelected = new BetterEmbed(interaction)
                .setColor(Options.colorsWarning)
                .setTitle(i18n.getMessage('commandsReloadSingleUnknownTitle'))
                .setDescription(
                    i18n.getMessage('commandsReloadSingleUnknownDescription', [
                        typeName,
                        item,
                    ],
                    ));

            await interaction.editReply({ embeds: [undefinedSelected] });
            return;
        }

        this.reloadItem(selected);

        const reloadedEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(i18n.getMessage('commandsReloadSingleSuccessTitle'))
            .setDescription(
                i18n.getMessage('commandsReloadSingleSuccessDescription', [
                    typeName,
                    item,
                    Date.now() - now,
                ]),
            );

        Log.command(
            interaction,
            `${typeName}.${item} was successfully reloaded after ${
                Date.now() - now
            } milliseconds.`,
        );

        await interaction.editReply({ embeds: [reloadedEmbed] });
    }

    private async reloadItem(item: Command | Listener) {
        await item.reload();
    }
}