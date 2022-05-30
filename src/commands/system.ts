import { BetterEmbed } from '../utility/BetterEmbed';
import {
    cleanLength,
    cleanRound,
} from '../utility/utility';
import {
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { Constants } from '../utility/Constants';
import { Options } from '../utility/Options';
import process from 'node:process';

export class SystemCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'system',
            description: 'View system information',
            cooldownDelay: 0,
            preconditions: [
                'i18n',
                'DeferReply',
                'DevMode',
                'OwnerOnly',
            ],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand({
            name: 'system',
            description: 'View system information',
        }, {
            guildIds: this.options.preconditions?.find(condition => condition === 'OwnerOnly')
                ? JSON.parse(process.env.OWNER_GUILDS!) as string[]
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        const { i18n } = interaction;

        const memoryMegaBytes = process.memoryUsage.rss() /
            Constants.bytesToMegaBytes;

        const responseEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(i18n.getMessage('commandsSystemTitle'))
            .addFields(
                {
                    name: i18n.getMessage('commandsSystemUptimeName'),
                    value: cleanLength(process.uptime() * Constants.msSecond)!,
                },
                {
                    name: i18n.getMessage('commandsSystemMemoryName'),
                    value: i18n.getMessage('commandsSystemMemberValue', [
                        cleanRound(memoryMegaBytes, 1),
                    ]),
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