/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

export const enum Events {
    ChannelCreate = 'channelCreate',
    ChannelDelete = 'channelDelete',
    ChannelPinsUpdate = 'channelPinsUpdate',
    ChannelUpdate = 'channelUpdate',
    ClientReady = 'ready',
    Debug = 'debug',
    Error = 'error',
    GuildBanAdd = 'guildBanAdd',
    GuildBanRemove = 'guildBanRemove',
    GuildCreate = 'guildCreate',
    GuildDelete = 'guildDelete',
    GuildEmojiCreate = 'emojiCreate',
    GuildEmojiDelete = 'emojiDelete',
    GuildEmojiUpdate = 'emojiUpdate',
    GuildIntegrationsUpdate = 'guildIntegrationsUpdate',
    GuildMemberAdd = 'guildMemberAdd',
    GuildMemberAvailable = 'guildMemberAvailable',
    GuildMemberRemove = 'guildMemberRemove',
    GuildMembersChunk = 'guildMembersChunk',
    GuildMemberUpdate = 'guildMemberUpdate',
    GuildRoleCreate = 'roleCreate',
    GuildRoleDelete = 'roleDelete',
    GuildRoleUpdate = 'roleUpdate',
    GuildStickerCreate = 'stickerCreate',
    GuildStickerDelete = 'stickerDelete',
    GuildStickerUpdate = 'stickerUpdate',
    GuildUnavailable = 'guildUnavailable',
    GuildUpdate = 'guildUpdate',
    InteractionCreate = 'interactionCreate',
    Invalidated = 'invalidated',
    InvalidRequestWarning = 'invalidRequestWarning',
    InviteCreate = 'inviteCreate',
    InviteDelete = 'inviteDelete',
    MessageBulkDelete = 'messageDeleteBulk',
    MessageCreate = 'messageCreate',
    MessageDelete = 'messageDelete',
    MessageReactionAdd = 'messageReactionAdd',
    MessageReactionRemove = 'messageReactionRemove',
    MessageReactionRemoveAll = 'messageReactionRemoveAll',
    MessageReactionRemoveEmoji = 'messageReactionRemoveEmoji',
    MessageUpdate = 'messageUpdate',
    PersistentNotification = 'persistentNotification',
    PresenceUpdate = 'presenceUpdate',
    RateLimit = 'rateLimit',
    Raw = 'raw',
    ShardDisconnect = 'shardDisconnect',
    ShardError = 'shardError',
    ShardReady = 'shardReady',
    ShardReconnecting = 'shardReconnecting',
    ShardResume = 'shardResume',
    StageInstanceCreate = 'stageInstanceCreate',
    StageInstanceDelete = 'stageInstanceDelete',
    StageInstanceUpdate = 'stageInstanceUpdate',
    ThreadCreate = 'threadCreate',
    ThreadDelete = 'threadDelete',
    ThreadListSync = 'threadListSync',
    ThreadMembersUpdate = 'threadMembersUpdate',
    ThreadMemberUpdate = 'threadMemberUpdate',
    ThreadUpdate = 'threadUpdate',
    TypingStart = 'typingStart',
    UserUpdate = 'userUpdate',
    VoiceServerUpdate = 'voiceServerUpdate',
    VoiceStateUpdate = 'voiceStateUpdate',
    Warn = 'warn',
    WebhooksUpdate = 'webhookUpdate',
    /**
     * Emitted when a message is created that was not sent by bots or webhooks.
     * @param {Message} message The created message
     */
    PreMessageParsed = 'preMessageParsed',
    /**
     * Emitted when a message is created consisting of only the bot's mention.
     * @param {Message} message The created message
     */
    MentionPrefixOnly = 'mentionPrefixOnly',
    /**
     * Emitted when a message is created that does not start with a valid prefix.
     * @param {Message} message The created message
     */
    NonPrefixedMessage = 'nonPrefixedMessage',
    /**
     * Emitted when a message is created that does starts with a valid prefix.
     * @param {Message} message The created message
     */
    PrefixedMessage = 'prefixedMessage',
    /**
     * Emitted when a message starts with a valid prefix but does not include a command name.
     * @param {UnknownMessageCommandNamePayload} payload
     */
    UnknownMessageCommandName = 'unknownMessageCommandName',
    /**
     * Emitted when the name of a sent message command does not match any loaded commands.
     * @param {UnknownMessageCommandPayload} payload The contextual payload
     */
    UnknownMessageCommand = 'unknownMessageCommand',
    /**
     * Emitted when a message command is executed but a `messageRun` method is not found.
     * @param {CommandDoesNotHaveMessageCommandHandler} payload The contextual payload
     */
    CommandDoesNotHaveMessageCommandHandler = 'commandDoesNotHaveMessageCommandHandler',
    /**
     * Emitted before the `messageRun` method of a command is run.
     * @param {PreMessageCommandRunPayload} payload The contextual payload
     */
    PreMessageCommandRun = 'preMessageCommandRun',
    /**
     * Emitted when a precondition denies a message command from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {MessageCommandDeniedPayload} payload The contextual payload
     */
    MessageCommandDenied = 'messageCommandDenied',
    /**
     * Emitted when a message command passes all precondition checks, if any.
     * @param {MessageCommandAcceptedPayload} payload The contextual payload
     */
    MessageCommandAccepted = 'messageCommandAccepted',
    /**
     * Emitted directly before a message command is run.
     * @param {Message} message The message that executed the command
     * @param {Command} command The command that is being run
     * @param {MessageCommandRunPayload} payload The contextual payload
     */
    MessageCommandRun = 'messageCommandRun',
    /**
     * Emitted after a message command runs successfully.
     * @param {MessageCommandSuccessPayload} payload The contextual payload
     */
    MessageCommandSuccess = 'messageCommandSuccess',
    /**
     * Emitted after a message command runs unsuccesfully.
     * @param {*} error The error that was thrown
     * @param {MessageCommandErrorPayload} payload The contextual payload
     */
    MessageCommandError = 'messageCommandError',
    /**
     * Emitted directly after a message command finished running, regardless of the outcome.
     * @param {Message} message The message that executed the command
     * @param {Command} command The command that finished running
     * @param {MessageCommandFinishPayload} payload The contextual payload
     */
    MessageCommandFinish = 'messageCommandFinish',
    /**
     * Emitted after the bot unsuccessfully tried to start typing when a command is executed.
     * @param error The error that was thrown
     * @param payload The contextual payload
     */
    MessageCommandTypingError = 'messageCommandTypingError',
    /**
     * Emitted when an error is encountered when executing a listener.
     * @param {*} error The error that was thrown
     * @param {ListenerErrorPayload} payload The contextual payload
     */
    ListenerError = 'listenerError',
    /**
     * Emitted when an error is encountered when handling the command application command registry.
     * @param {*} error The error that was thrown
     * @param {Command} command The command who's registry caused the error
     */
    CommandApplicationCommandRegistryError = 'commandApplicationCommandRegistryError',
    /**
     * Emitted after a piece is loaded.
     * @param {Store<Piece>} store The store in which the piece belongs to
     * @param {Piece} piece The piece that was loaded
     */
    PiecePostLoad = 'piecePostLoad',
    /**
     * Emitted when a piece is unloaded.
     * @param {Store<Piece>} store The store in which the piece belongs to
     * @param {Piece} piece The piece that was unloaded
     */
    PieceUnload = 'pieceUnload',
    /**
     * Emitted when a plugin is loaded.
     * @param {PluginHook} hook The plugin hook that was loaded
     * @param {string | undefined} name The name of the plugin, if any
     */
    PluginLoaded = 'pluginLoaded',
    /**
     * Emitted when the `parse` method of an interaction handler encounters an error.
     * @param {*} error The error that was encountered
     * @param {InteractionHandlerParseError} payload The contextual payload
     */
    InteractionHandlerParseError = 'interactionHandlerParseError',
    /**
     * Emitted when an error is encountered when executing an interaction handler.
     * @param {*} error The error that was encountered
     * @param {InteractionHandlerError} payload The contextual payload
     */
    InteractionHandlerError = 'interactionHandlerError',
    /**
     * Emitted when an autocomplete interaction is recieved.
     * @param {AutocompleteInteraction} interaction The interaction that was recieved
     */
    PossibleAutocompleteInteraction = 'possibleAutocompleteInteraction',
    /**
     * Emitted after an autocomplete interaction handler runs successfully.
     * @param {AutocompleteInteractionPayload} payload The contextual payload
     */
    CommandAutocompleteInteractionSuccess = 'commandAutocompleteInteractionSuccess',
    /**
     * Emitted when an error is encountered when executing an autocomplete interaction handler.
     * @param {*} error The error that was encountered
     * @param {AutocompleteInteractionPayload} payload The contextual payload
     */
    CommandAutocompleteInteractionError = 'commandAutocompleteInteractionError',
    /**
     * Emitted when a chat input command interaction is recieved.
     * @param {CommandInteraction} interaction The interaction that was recieved.
     */
    PossibleChatInputCommand = 'possibleChatInputCommand',
    /**
     * Emitted when the name of a sent chat input command does not match any loaded commands.
     * @param {UnknownChatInputCommandPayload} payload The contextual payload
     */
    UnknownChatInputCommand = 'unknownChatInputCommand',
    /**
     * Emitted when a chat input command is executed but a `chatInputRun` method is not found.
     * @param {CommandDoesNotHaveChatInputCommandHandlerPayload} payload The contextual payload
     */
    CommandDoesNotHaveChatInputCommandHandler = 'commandDoesNotHaveChatInputCommandHandler',
    /**
     * Emitted before the `chatInputRun` method of a command is run.
     * @param {PreChatInputCommandRunPayload} payload The contextual payload
     */
    PreChatInputCommandRun = 'preChatInputCommandRun',
    /**
     * Emitted when a precondition denies a chat input command from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {ChatInputCommandDeniedPayload} payload The contextual payload
     */
    ChatInputCommandDenied = 'chatInputCommandDenied',
    /**
     * Emitted when a chat input command passes all precondition checks, if any.
     * @param {ChatInputCommandAcceptedPayload} payload The contextual payload
     */
    ChatInputCommandAccepted = 'chatInputCommandAccepted',
    /**
     * Emitted directly before a chat input command is run.
     * @param {CommandInteraction} interaction The interaction that executed the command
     * @param {ChatInputCommand} command The command that is being run
     * @param {ChatInputCommandRunPayload} payload The contextual payload
     */
    ChatInputCommandRun = 'chatInputCommandRun',
    /**
     * Emitted after a chat input command runs successfully.
     * @param {ChatInputCommandSuccessPayload} payload The contextual payload
     */
    ChatInputCommandSuccess = 'chatInputCommandSuccess',
    /**
     * Emitted after a chat input command runs unsuccesfully.
     * @param {*} error The error that was thrown
     * @param {ChatInputCommandErrorPayload} payload The contextual payload
     */
    ChatInputCommandError = 'chatInputCommandError',
    /**
     * Emitted directly after a chat input command finished running, regardless of the outcome.
     * @param {Interaction} interaction The interaction that executed the command
     * @param {ChatInputCommand} command The command that finished running
     * @param {ChatInputCommandFinishPayload} payload The contextual payload
     */
    ChatInputCommandFinish = 'chatInputCommandFinish',
    /**
     * Emitted when a context menu interaction is recieved.
     * @param {ContextMenuInteraction} interaction The interaction that was recieved.
     */
    PossibleContextMenuCommand = 'possibleContextMenuCommand',
    /**
     * Emitted when the name of a sent context menu command does not match any loaded commands.
     * @param {UnknownContextMenuCommandPayload} payload The contextual payload
     */
    UnknownContextMenuCommand = 'unknownContextMenuCommand',
    /**
     * Emitted when a chat input command is executed but a `contextMenuRun` method is not found.
     * @param {CommandDoesNotHaveContextMenuCommandHandlerPayload} payload The contextual payload
     */
    CommandDoesNotHaveContextMenuCommandHandler = 'commandDoesNotHaveContextMenuCommandHandler',
    /**
     * Emitted before the `contextMenuRun` method of a command is run.
     * @param {PreContextMenuCommandRunPayload} payload The contextual payload
     */
    PreContextMenuCommandRun = 'preContextMenuCommandRun',
    /**
     * Emitted when a precondition denies a context menu command from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {ContextMenuCommandDeniedPayload} payload The contextual payload
     */
    ContextMenuCommandDenied = 'contextMenuCommandDenied',
    /**
     * Emitted when a context menu command passes all precondition checks, if any.
     * @param {ContextMenuCommandAcceptedPayload} payload The contextual payload
     */
    ContextMenuCommandAccepted = 'contextMenuCommandAccepted',
    /**
     * Emitted directly before a context menu command is run.
     * @param {ContextMenuInteraction} interaction The interaction that executed the command
     * @param {ContextMenuCommand} command The command that is being run
     * @param {ContextMenuCommandRunPayload} payload The contextual payload
     */
    ContextMenuCommandRun = 'contextMenuCommandRun',
    /**
     * Emitted after a context menu command runs successfully.
     * @param {ContextMenuCommandSuccessPayload} payload The contextual payload
     */
    ContextMenuCommandSuccess = 'contextMenuCommandSuccess',
    /**
     * Emitted after a context menu command runs unsuccesfully.
     * @param {*} error The error that was thrown
     * @param {ContextMenuCommandErrorPayload} payload The contextual payload
     */
    ContextMenuCommandError = 'contextMenuCommandError',
    /**
     * Emitted directly after a context menu command finished running, regardless of the outcome.
     * @param {Interaction} interaction The interaction that executed the command
     * @param {ContextMenuCommand} command The command that finished running
     * @param {ContextMenuCommandFinishPayload} payload The contextual payload
     */
    ContextMenuCommandFinish = 'contextMenuCommandFinish',
}