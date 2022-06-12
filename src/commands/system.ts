import {
    ApplicationCommandRegistry,
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { BetterEmbed } from '../structures/BetterEmbed';
import { Bytes } from '../enums/Bytes';
import {
    cleanLength,
    cleanRound,
} from '../utility/utility';
import { type CommandInteraction } from 'discord.js';
import { Options } from '../utility/Options';
import { Preconditions } from '../enums/Preconditions';
import { Time } from '../enums/Time';
import process from 'node:process';

export class SystemCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'system',
            description: 'View system information',
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
            name: 'system',
            description: 'View system information',
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

        const memoryMegaBytes = process.memoryUsage.rss() / Bytes.MegaByte;

        const responseEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(i18n.getMessage('commandsSystemTitle'))
            .addFields(
                {
                    name: i18n.getMessage('commandsSystemUptimeName'),
                    value: cleanLength(process.uptime() * Time.Second)!,
                },
                {
                    name: i18n.getMessage('commandsSystemMemoryName'),
                    value: i18n.getMessage(
                        'commandsSystemMemberValue', [
                            cleanRound(memoryMegaBytes, 1),
                        ],
                    ),
                },
                {
                    name: i18n.getMessage('commandsSystemServersName'),
                    value: String(interaction.client.guilds.cache.size),
                },
                {
                    name: i18n.getMessage('commandsSystemUsersName'),
                    value: String(
                        interaction.client.guilds.cache.reduce(
                            (acc, guild) => acc + guild.memberCount,
                            0,
                        ),
                    ),
                },
            );

        await interaction.editReply({
            embeds: [responseEmbed],
        });
    }
}