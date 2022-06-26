import {
    type ApplicationCommandRegistry,
    BucketScope,
    Command,
    RegisterBehavior,
} from '@sapphire/framework';
import { type CommandInteraction } from 'discord.js';

export class TestCommand extends Command {
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

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: 'test',
            description: 'Does stuff',
            options: [
                {
                    name: 'delete',
                    type: 2,
                    description: 'Delete all of your data',
                    options: [
                        {
                            name: 'view',
                            description: 'Returns a file with all of your data',
                            type: 1,
                            options: [
                                {
                                    name: 'command',
                                    type: 3,
                                    description: 'A command to get info about. This parameter is completely optional',
                                    required: false,
                                },
                            ],
                        },
                    ],
                },
            ],
        }, {
            guildIds: this.options.preconditions?.find(
                (condition) => condition === 'OwnerOnly',
            )
                ? this.container.config.ownerGuilds
                : undefined, // eslint-disable-line no-undefined
            registerCommandIfMissing: true,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        });
    }

    public async chatInputCommand(interaction: CommandInteraction) {
        await interaction.followUp({
            content: 'e',
        });

        throw new TypeError();
    }
}