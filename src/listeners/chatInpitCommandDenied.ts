import {
    ChatInputCommandDeniedPayload,
    Events,
    Listener,
    UserError,
} from '@sapphire/framework';
import { CommandConstraintErrorHandler } from '../errors/CommandInteractionConstraintErrorHandler';

export class CommandErrorListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        await new CommandConstraintErrorHandler(
            error,
            payload.interaction,
        ).init();
    }
}