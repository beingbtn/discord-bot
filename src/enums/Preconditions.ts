/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */

export const enum Preconditions {
    DevMode = 'preconditionDevMode',
    OwnerOnly = 'preconditionOwnerOnly',
    Cooldown = 'preconditionCooldown',
    DMOnly = 'preconditionDmOnly',
    GuildNewsOnly = 'preconditionGuildNewsOnly',
    GuildNewsThreadOnly = 'preconditionGuildNewsThreadOnly',
    GuildOnly = 'preconditionGuildOnly',
    GuildPrivateThreadOnly = 'preconditionGuildPrivateThreadOnly',
    GuildPublicThreadOnly = 'preconditionGuildPublicThreadOnly',
    GuildTextOnly = 'preconditionGuildTextOnly',
    NSFW = 'preconditionNsfw',
    ClientPermissions = 'preconditionClientPermissions',
    ClientPermissionsNoClient = 'preconditionClientPermissionsNoClient',
    ClientPermissionsNoPermissions = 'preconditionClientPermissionsNoPermissions',
    UserPermissions = 'preconditionUserPermissions',
    UserPermissionsNoPermissions = 'preconditionUserPermissionsNoPermissions',
    ThreadOnly = 'preconditionThreadOnly',
}