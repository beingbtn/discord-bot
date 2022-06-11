import {
    type ChatInputCommandErrorPayload,
    Listener,
} from '@sapphire/framework';
import { Events } from '../enums/Events';
import { InteractionErrorHandler } from '../errors/InteractionErrorHandler';

export class ChatInputErrorListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.ChatInputCommandError,
        });
    }

    public async run(error: Error, payload: ChatInputCommandErrorPayload) {
        await InteractionErrorHandler.init(
            error,
            payload.interaction,
        );
    }
}