import { EmbedLimits } from '@sapphire/discord-utilities';
import {
    type ApplicationCommandRegistry,
    BucketScope,
    Command,
} from '@sapphire/framework';
import {
    type CommandInteraction,
    Formatters,
} from 'discord.js';
import { BetterEmbed } from '../structures/BetterEmbed';
import { Options } from '../utility/Options';
import { interactionLogContext } from '../utility/utility';

export class PutCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'put',
            description: 'Put members',
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

        this.chatInputStructure = {
            name: this.name,
            description: this.description,
        };
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(
            this.chatInputStructure,
            Options.commandRegistry(this),
        );
    }

    public async chatInputRun(interaction: CommandInteraction) {
        const { i18n } = interaction;

        const guild = interaction.client.guilds.cache.get(Options.guild)!;

        const members = await guild.members.fetch();

        const users = members
            .map((member) => member.user)
            .filter((user) => user.bot === false);

        const request = await fetch('https://btn.attituding.workers.dev/members', {
            body: JSON.stringify(users),
            headers: {
                Authorization: `Basic ${process.env.BRIDGE_AUTHORIZATION}`,
            },
            method: 'PUT',
        });

        if (request.ok === false) {
            throw new Error(String(request.status));
        }

        const pingEmbed = new BetterEmbed(interaction)
            .setColor(Options.colorsNormal)
            .setTitle(
                i18n.getMessage(
                    'commandsPutTitle',
                ),
            )
            .setDescription(
                Formatters.codeBlock(
                    JSON.stringify(users),
                ).slice(0, EmbedLimits.MaximumDescriptionLength),
            );

        this.container.logger.info(
            interactionLogContext(interaction),
            `${this.constructor.name}:`,
            'Successfully put members',
            users,
        );

        await interaction.editReply({
            embeds: [pingEmbed],
        });
    }
}