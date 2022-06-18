import {
    type ApplicationCommandRegistry,
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { type CommandInteraction } from 'discord.js';
import { BetterEmbed } from '../structures/BetterEmbed';
import { Options } from '../utility/Options';
import { Preconditions } from '../enums/Preconditions';

export class PerformanceCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'performance',
            description: 'View system performance',
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
            name: 'performance',
            description: 'View system performance',
        }, {
            guildIds: this.options.preconditions?.find(
                (condition) => condition === Preconditions.OwnerOnly,
            )
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const {
            fetch: fetchPerformance,
            parse: parsePerformance,
            check: checkPerformance,
            send: sendPerformance,
            total,
        } = this.container.core.performance.latest!;

        const responseEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsPerformanceTitle',
                ),
            )
            .addFields({
                name: i18n.getMessage('commandsPerformanceLatestName'),
                value: i18n.getMessage(
                    'commandsPerformanceLatestValue', [
                        fetchPerformance,
                        parsePerformance,
                        checkPerformance,
                        sendPerformance,
                        total,
                    ],
                ),
            });

        await interaction.editReply({
            embeds: [responseEmbed],
        });
    }
}