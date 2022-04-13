/*
General Interfaces
*/
export interface BaseEmbed {
    title: string,
    description: string,
}

export interface Field {
    name: string,
    value: string,
}

/*
Command Interface
*/
export interface Announcements {
    botMissingPermission: BaseEmbed,
    userMissingPermission: BaseEmbed,
    add: {
        alreadyAdded: BaseEmbed,
    } & BaseEmbed,
    remove: {
        notFound: BaseEmbed,
    } & BaseEmbed,
}

export interface API {
    api: {
        yes: string,
        no: string,
        enabled: Field,
        resume: Field,
        lastMinute: Field,
        nextTimeouts: Field,
        apiKey: Field,
    }
    set: BaseEmbed,
    call: BaseEmbed,
}

export interface Config {
    on: string,
    off: string,
    core: BaseEmbed,
    devMode: BaseEmbed,
    interval: BaseEmbed,
    restRequestTimeout: BaseEmbed,
    retryLimit: BaseEmbed,
    view: BaseEmbed;
}

export interface Deploy {
    title: string,
    none: string,
}

export interface EditAnnouncements {
    preview: {
        title: string,
        description: string,
        buttonLabel: string,
    },
    success: {
        title: string,
        description: string,
    },
}

export interface Eval {
    maxLength: Field,
    success: {
        title: string,
        input: Field,
        output: Field,
        type: Field,
        timeTaken: Field,
    },
    fail: {
        title: string,
        input: Field,
    }
}

export interface Help {
    information: {
        introduction: Field,
        category: Field,
        legal: Field,
    },
    all: {
        title: string,
        field: Field,
    },
    specific: {
        invalid: BaseEmbed,
        title: string,
        description: string,
        cooldown: Field,
        dm: Field,
        owner: Field,
    },
}

export interface Language {
    alreadyRemoved: BaseEmbed,
    reset: BaseEmbed,
    set: BaseEmbed,
}

export interface Performance {
    title: string,
    latest: Field,
}

export interface Ping {
    embed1: {
        title: string,
    },
    embed2: BaseEmbed,
}

export interface Presence {
    set: {
        none: string,
        title: string,
        status: Field,
        type: Field,
        name: Field,
        url: Field,
    },
    cleared: BaseEmbed,
}

export interface Reload {
    all: BaseEmbed,
    single: {
        unknown: BaseEmbed,
        success: BaseEmbed,
    }
}

export interface System {
    embed: {
        title: string,
        field1: Field,
        field2: Field,
        field3: Field,
        field4: Field,
    }
}

export interface Commands {
    announcements: Announcements,
    api: API,
    config: Config,
    deploy: Deploy,
    editannouncements: EditAnnouncements,
    eval: Eval,
    help: Help,
    language: Language,
    performance: Performance,
    ping: Ping,
    presence: Presence,
    reload: Reload,
    system: System,
}

/*
Errors
*/
export interface CommandErrors {
    embed: {
        field: Field,
    } & BaseEmbed,
}

export interface ConstraintErrors {
    devMode: BaseEmbed,
    owner: BaseEmbed,
    dm: BaseEmbed,
    cooldown: {
        embed1: BaseEmbed,
        embed2: BaseEmbed,
    },
}

export interface Errors {
    commandErrors: CommandErrors,
    constraintErrors: ConstraintErrors,
}

/*
Base
*/
export interface Locale {
    errors: Errors,
    commands: Commands,
}

export interface Locales {
    'en-US': Locale,
}

export interface Parameters {
    [index: string]: unknown,
}