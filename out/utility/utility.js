"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestamp = exports.timeAgo = exports.slashCommandResolver = exports.setPresence = exports.sendWebHook = exports.generateStackTrace = exports.formattedUnix = exports.createOffset = exports.cleanRound = exports.cleanLength = exports.cleanDate = exports.capitolToNormal = exports.BetterEmbed = exports.arrayRemove = exports.disableComponents = exports.awaitComponent = void 0;
const discord_js_1 = require("discord.js");
const Constants_1 = require("./Constants");
async function awaitComponent(channel, component, options) {
    try {
        return await channel.awaitMessageComponent({
            componentType: component,
            ...options,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error
                ?.code === 'INTERACTION_COLLECTOR_ERROR') {
            return null;
        }
        throw error;
    }
}
exports.awaitComponent = awaitComponent;
function disableComponents(messageActionRows) {
    const actionRows = messageActionRows
        .map(row => new discord_js_1.MessageActionRow(row));
    for (const actionRow of actionRows) {
        const components = actionRow.components;
        for (const component of components) {
            component.disabled = true;
        }
    }
    return actionRows;
}
exports.disableComponents = disableComponents;
function arrayRemove(array, ...items) {
    return array.filter(item => !(items.includes(item)));
}
exports.arrayRemove = arrayRemove;
class BetterEmbed extends discord_js_1.MessageEmbed {
    constructor(footer) {
        super();
        this.setTimestamp();
        if (footer instanceof discord_js_1.CommandInteraction) {
            const interaction = footer;
            const avatar = interaction.user.displayAvatarURL({ dynamic: true });
            this.setFooter({ text: `/${interaction.commandName}`, iconURL: avatar });
        }
        else if (footer !== undefined) {
            this.setFooter({ text: footer.text, iconURL: footer.iconURL });
        }
    }
    setField(name, value, inline) {
        this.setFields({ name: name, value: value, inline: inline });
        return this;
    }
    unshiftField(name, value, inline) {
        this.unshiftFields({ name: name, value: value, inline: inline });
        return this;
    }
    unshiftFields(...fields) {
        this.fields.unshift(...discord_js_1.MessageEmbed.normalizeFields(...fields));
        return this;
    }
}
exports.BetterEmbed = BetterEmbed;
function capitolToNormal(item) {
    function containsLowerCase(string) {
        let lowerCase = false;
        for (let i = 0; i < string.length; i += 1) {
            const character = string.charAt(i);
            if (character === character.toLowerCase()) {
                lowerCase = true;
                break;
            }
        }
        return lowerCase;
    }
    return typeof item === 'string'
        ? item
            .replaceAll('_', ' ')
            .toLowerCase()
            .split(' ')
            .map(value => {
            if (containsLowerCase(value)) {
                return value.charAt(0).toUpperCase() + value.slice(1);
            }
            return value;
        })
            .join(' ')
        : item;
}
exports.capitolToNormal = capitolToNormal;
function cleanDate(ms) {
    const newDate = new Date(ms);
    if (ms < 0 ||
        !isDate(newDate)) {
        return null;
    }
    const day = newDate.getDate(), month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(newDate), year = newDate.getFullYear();
    return `${month} ${day}, ${year}`;
}
exports.cleanDate = cleanDate;
function cleanLength(ms, rejectZero) {
    if (!isNumber(ms)) {
        return null;
    }
    let newMS = Math.floor(ms / Constants_1.Constants.ms.second) *
        Constants_1.Constants.ms.second;
    if (rejectZero ? newMS <= 0 : newMS < 0) {
        return null;
    }
    const days = Math.floor(newMS / Constants_1.Constants.ms.day);
    newMS -= days * Constants_1.Constants.ms.day;
    const hours = Math.floor(newMS / Constants_1.Constants.ms.hour);
    newMS -= hours * Constants_1.Constants.ms.hour;
    const minutes = Math.floor(newMS / Constants_1.Constants.ms.minute);
    newMS -= minutes * Constants_1.Constants.ms.minute;
    const seconds = Math.floor(newMS / Constants_1.Constants.ms.second);
    return days > 0
        ? `${days}d ${hours}h ${minutes}m ${seconds}s`
        : hours > 0
            ? `${hours}h ${minutes}m ${seconds}s`
            : minutes > 0
                ? `${minutes}m ${seconds}s`
                : `${seconds}s`;
}
exports.cleanLength = cleanLength;
function cleanRound(number, decimals) {
    const decimalsFactor = 10 ** (decimals ?? 2);
    return Math.round(number * decimalsFactor) / decimalsFactor;
}
exports.cleanRound = cleanRound;
//Taken from https://stackoverflow.com/a/13016136 under CC BY-SA 3.0 matching ISO 8601
function createOffset(date = new Date()) {
    function pad(value) {
        return value < 10 ? `0${value}` : value;
    }
    const sign = date.getTimezoneOffset() > 0 ? '-' : '+', offset = Math.abs(date.getTimezoneOffset()), hours = pad(Math.floor(offset / 60)), minutes = pad(offset % 60);
    return `${sign + hours}:${minutes}`;
}
exports.createOffset = createOffset;
function formattedUnix({ ms = Date.now(), date = false, utc = true, }) {
    const newDate = new Date(ms);
    if (ms < 0 ||
        !isDate(newDate)) {
        return null;
    }
    return `${utc === true ? `UTC${createOffset()} ` : ''}${newDate.toLocaleTimeString('en-IN', { hour12: true })}${date === true ? `, ${cleanDate(ms)}` : ''}`;
}
exports.formattedUnix = formattedUnix;
function generateStackTrace() {
    const stack = new Error().stack ?? '';
    const cleanStack = stack
        .split('\n')
        .splice(2)
        .join('\n');
    return cleanStack;
}
exports.generateStackTrace = generateStackTrace;
async function sendWebHook({ webhook, suppressError, ...payload }) {
    try {
        await new discord_js_1.WebhookClient({ id: webhook.id, token: webhook.token })
            .send(payload);
    }
    catch (err) {
        if (suppressError === false) {
            throw err;
        }
    }
}
exports.sendWebHook = sendWebHook;
function setPresence(client) {
    let presence = client.customPresence;
    if (presence === null) {
        //@ts-expect-error typings not available yet for structuredClone
        presence = structuredClone(Constants_1.Constants.defaults.presence);
        presence.activities?.forEach(activity => {
            activity.name = activity.name
                ?.replace('{{ servers }}', String(client.guilds.cache.size));
        });
    }
    client.user?.setPresence(presence);
}
exports.setPresence = setPresence;
const slashCommandResolver = (interaction) => {
    const commandOptions = [
        `/${interaction.commandName}`,
    ];
    for (let option of interaction.options.data) {
        if (option.value) {
            commandOptions.push(`${option.name}: ${option.value}`);
        }
        if (option.type === 'SUB_COMMAND_GROUP') {
            commandOptions.push(option.name);
            [option] = option.options;
        }
        if (option.type === 'SUB_COMMAND') {
            commandOptions.push(option.name);
        }
        if (Array.isArray(option.options)) {
            for (const subOption of option.options) {
                commandOptions.push(`${subOption.name}: ${subOption.value}`);
            }
        }
    }
    return commandOptions.join(' ');
};
exports.slashCommandResolver = slashCommandResolver;
function timeAgo(ms) {
    if (!isNumber(ms) ||
        ms < 0) {
        return null;
    }
    return Date.now() - ms;
}
exports.timeAgo = timeAgo;
function timestamp(ms, style) {
    if (!isNumber(ms) ||
        ms < 0) {
        return null;
    }
    return discord_js_1.Formatters.time(Math.round(ms / 1000), style ?? 'f');
}
exports.timestamp = timestamp;
function isDate(value) {
    return Object.prototype.toString.call(value) === '[object Date]';
}
function isNumber(value) {
    return typeof value === 'number';
}
