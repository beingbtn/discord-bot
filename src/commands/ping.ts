import {
    ColorResolvable,
    Message,
} from 'discord.js';
import { BetterEmbed } from '../utility/BetterEmbed';
import {
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { Log } from '../utility/Log';
import { Options } from '../utility/Options';

export class PingCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'ping',
            description: 'Ping!',
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
            name: 'ping',
            description: 'Ping!',
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
        const { i18n } = interaction;

        const initialPingEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsPingLoadingTitle',
                ),
            );

        const sentReply = await interaction.editReply({
            embeds: [initialPingEmbed],
        });

        const roundTripDelay = (
            sentReply instanceof Message
                ? sentReply.createdTimestamp
                : Date.parse(sentReply.timestamp)
        ) - interaction.createdTimestamp;

        const mixedPing = (
            interaction.client.ws.ping + roundTripDelay
        ) / 2;

        const embedColor: ColorResolvable = mixedPing < Options.pingOnMinimum
            ? Options.colorsOn
            : mixedPing < Options.pingOkMinimum
            ? Options.colorsOk
            : Options.colorsWarning;

        const pingEmbed = new BetterEmbed(interaction)
            .setColor(embedColor)
            .setTitle(
                i18n.getMessage(
                    'commandsPingTitle',
                ),
            )
            .setDescription(
                i18n.getMessage(
                    'commandsPingDescription', [
                        interaction.client.ws.ping,
                        roundTripDelay,
                    ],
                ),
            );

        Log.command(
            interaction,
            `WS: ${
                interaction.client.ws.ping
            }ms | RT: ${
                roundTripDelay
            }ms`,
        );

        await interaction.editReply({
            embeds: [pingEmbed],
        });
    }
}