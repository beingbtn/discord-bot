import {
    type MessageCommandDeniedPayload,
    Listener,
    type UserError,
} from '@sapphire/framework';
import { InteractionPreconditionErrorHandler } from '../errors/InteractionPreconditionErrorHandler';
import { Events } from '../enums/Events';

export class MessageCommandDeniedListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.MessageCommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageCommandDeniedPayload) {
        // TODO: message version of interaction precondition handler
    }
}