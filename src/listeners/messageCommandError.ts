import {
    type MessageCommandErrorPayload,
    Listener,
} from '@sapphire/framework';
import { Events } from '../enums/Events';
import { InteractionErrorHandler } from '../errors/InteractionErrorHandler';

export class MessageCommandErrorListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.MessageCommandError,
        });
    }

    public async run(error: Error, payload: MessageCommandErrorPayload) {
        // TODO: message version of interaction error handler
    }
}