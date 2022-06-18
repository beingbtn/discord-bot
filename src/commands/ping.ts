import {
    type ApplicationCommandRegistry,
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import {
    type ColorResolvable,
    type CommandInteraction,
    Message,
} from 'discord.js';
import { BetterEmbed } from '../structures/BetterEmbed';
import { Log } from '../structures/Log';
import { Options } from '../utility/Options';
import { Preconditions } from '../enums/Preconditions';

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
            name: 'ping',
            description: 'Ping!',
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

        let embedColor: ColorResolvable;

        if (mixedPing < Options.pingOnMinimum) {
            embedColor = Options.colorsOn;
        } else if (mixedPing < Options.pingOkMinimum) {
            embedColor = Options.colorsOk;
        } else {
            embedColor = Options.colorsWarning;
        }

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