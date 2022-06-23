import {
    type ContextMenuCommandDeniedPayload,
    Listener,
    type UserError,
} from '@sapphire/framework';
import { InteractionPreconditionErrorHandler } from '../errors/InteractionPreconditionErrorHandler';
import { Events } from '../enums/Events';

export class ContextMenuCommandDeniedListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: Events.ContextMenuCommandDenied,
        });
    }

    public async run(error: UserError, payload: ContextMenuCommandDeniedPayload) {
        await new InteractionPreconditionErrorHandler(
            error,
            payload.interaction,
            payload.command,
        ).init();
    }
}