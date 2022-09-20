import {
    Events,
    Listener,
} from '@sapphire/framework';
import { type GuildMember } from 'discord.js';
import { HTTPError } from '../errors/HTTPError';
import { HTTPErrorHandler } from '../errors/HTTPErrorHandler';
import { Request } from '../structures/Request';
import { Options } from '../utility/Options';

export class GuildMemberRemoveListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.GuildMemberRemove,
        });
    }

    public async run(member: GuildMember) {
        const { user } = member;

        if (member.guild.id === Options.guild && user.bot === false) {
            this.container.logger.info(
                `${this.constructor.name}:`,
                'Member removed',
                user,
            );

            try {
                const url = 'https://btn.attituding.workers.dev/member';

                const request = await new Request().request(url, {
                    body: user.id,
                    headers: {
                        Authorization: `Basic ${process.env.BRIDGE_AUTHORIZATION}`,
                    },
                    method: 'DELETE',
                });

                if (request.ok === false) {
                    throw new HTTPError({
                        response: request,
                        url: url,
                    });
                }
            } catch (error) {
                new HTTPErrorHandler(error).init();
            }
        }
    }
}