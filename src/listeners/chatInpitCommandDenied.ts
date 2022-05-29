import { ChatInputCommandDeniedPayload, Listener, UserError } from '@sapphire/framework';
import { CommandConstraintErrorHandler } from '../errors/CommandInteractionConstraintErrorHandler';

export class CommandErrorListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: 'chatInputCommandDenied',
        });
    }

    public run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        new CommandConstraintErrorHandler(
            error,
            payload.interaction,
        ).init();
    }
}