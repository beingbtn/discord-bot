import { BaseCommandInteractionPreconditionErrorHandler } from '../errors/BaseCommandInteractionPreconditionErrorHandler';
import {
    ChatInputCommandDeniedPayload,
    Events,
    Listener,
    UserError,
} from '@sapphire/framework';

export class CommandErrorListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        await new BaseCommandInteractionPreconditionErrorHandler(
            error,
            payload.interaction,
            payload.command,
        ).init();
    }
}