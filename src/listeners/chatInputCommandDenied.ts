import {
    type ChatInputCommandDeniedPayload,
    Listener,
    type UserError,
} from '@sapphire/framework';
import { ChatInputCommandPreconditionErrorHandler } from '../errors/ChatInputCommandPreconditionErrorHandler';
import { Events } from '../enums/Events';

export class ChatInputErrorListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.ChatInputCommandDenied,
        });
    }

    public async run(error: UserError, payload: ChatInputCommandDeniedPayload) {
        await new ChatInputCommandPreconditionErrorHandler(
            error,
            payload.interaction,
            payload.command,
        ).init();
    }
}