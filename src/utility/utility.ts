import {
    AwaitMessageCollectorOptionsParams,
    Client,
    CommandInteraction,
    Formatters,
    MessageActionRow,
    MessageComponentTypeResolvable,
    TextBasedChannel,
} from 'discord.js';
import { Constants } from './constants1';

export async function awaitComponent<T extends MessageComponentTypeResolvable>(
    channel: TextBasedChannel,
    options: AwaitMessageCollectorOptionsParams<T, true>,
) {
    try {
        return await channel.awaitMessageComponent<T>(options);
    } catch (error) {
        if (
            error instanceof Error &&
            (error as Error & { code: string })
                ?.code === 'INTERACTION_COLLECTOR_ERROR'
        ) {
            return null;
        }

        throw error;
    }
}

export function disableComponents(messageActionRows: MessageActionRow[]) {
    const actionRows = messageActionRows
        .map(row => new MessageActionRow(row));

    for (const actionRow of actionRows) {
        const components = actionRow.components;

        for (const component of components) {
            component.disabled = true;
        }
    }

    return actionRows;
}

export function cleanDate(ms: number | Date): string | null {
    const newDate = new Date(ms);
    if (
        ms < 0 ||
        !isDate(newDate)
    ) {
        return null;
    }

    const day = newDate.getDate();

    const month = new Intl.DateTimeFormat(
        'en-US',
        { month: 'short' },
    ).format(
        newDate,
    );

    const year = newDate.getFullYear();

    return `${month} ${day}, ${year}`;
}

export function cleanLength(ms: number | null): string | null {
    if (!isNumber(ms)) {
        return null;
    }

    let newMS = Math.floor(ms / Constants.ms.second) *
        Constants.ms.second;

    const days = Math.floor(newMS / Constants.ms.day);
    newMS -= days * Constants.ms.day;
    const hours = Math.floor(newMS / Constants.ms.hour);
    newMS -= hours * Constants.ms.hour;
    const minutes = Math.floor(newMS / Constants.ms.minute);
    newMS -= minutes * Constants.ms.minute;
    const seconds = Math.floor(newMS / Constants.ms.second);

    return days > 0
        ? `${days}d ${hours}h ${minutes}m ${seconds}s`
        : hours > 0
            ? `${hours}h ${minutes}m ${seconds}s`
            : minutes > 0
                ? `${minutes}m ${seconds}s`
                : `${seconds}s`;
}

export function cleanRound(number: number, decimals?: number) {
    const decimalsFactor = 10 ** (decimals ?? 2);
    return Math.round(number * decimalsFactor) / decimalsFactor;
}

//Taken from https://stackoverflow.com/a/13016136 under CC BY-SA 3.0 matching ISO 8601
export function createOffset(date = new Date()): string {
    function pad(value: number) {
        return value < 10 ? `0${value}` : value;
    }

    const sign = date.getTimezoneOffset() > 0 ? '-' : '+';
    const offset = Math.abs(date.getTimezoneOffset());
    const hours = pad(Math.floor(offset / 60));
    const minutes = pad(offset % 60);

    return `${sign + hours}:${minutes}`;
}

export function formattedUnix({
    ms = Date.now(),
    date = false,
    utc = true,
}: {
    ms?: number | Date,
    date: boolean,
    utc: boolean,
}): string | null {
    const newDate = new Date(ms);
    if (
        ms < 0 ||
        !isDate(newDate)
    ) {
        return null;
    }

    const utcString = utc === true
        ? `UTC${createOffset()} `
        : '';

    const timeString = newDate.toLocaleTimeString(
        'en-IN',
        { hour12: true },
    );

    const dateString = date === true
        ? `, ${cleanDate(ms)}`
        : '';

    return `${utcString}${timeString}${dateString}`;
}

export function generateStackTrace() {
    const stack = new Error().stack ?? '';
    const cleanStack = stack
        .split('\n')
        .splice(2)
        .join('\n');

    return cleanStack;
}

export function setPresence(client: Client) {
    let presence = client.customPresence;

    if (presence === null) {
        presence = structuredClone(Constants.defaults.presence);
    }

    client.user?.setPresence(presence!);
}

export const slashCommandResolver = (interaction: CommandInteraction) => {
    const commandOptions: (string | number | boolean)[] = [
        `/${interaction.commandName}`,
    ];

    for (let option of interaction.options.data) {
        if (option.value) {
            commandOptions.push(
                `${option.name}: ${option.value}`,
            );
        }

        if (option.type === 'SUB_COMMAND_GROUP') {
            commandOptions.push(option.name);
            [option] = option.options!;
        }

        if (option.type === 'SUB_COMMAND') {
            commandOptions.push(option.name);
        }

        if (Array.isArray(option.options)) {
            for (const subOption of option.options) {
                commandOptions.push(
                    `${subOption.name}: ${subOption.value}`,
                );
            }
        }
    }

    return commandOptions.join(' ');
};

export function timestamp(
    ms: unknown,
    style?: typeof Formatters.TimestampStylesString,
) {
    if (
        !isNumber(ms) ||
        ms < 0
    ) {
        return null;
    }

    return Formatters.time(Math.round(ms / 1000), style ?? 'f');
}

function isDate(value: unknown): value is Date {
    return Object.prototype.toString.call(value) === '[object Date]';
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}