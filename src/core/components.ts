import {
    Constants,
    MessageActionRow,
    MessageButton,
} from 'discord.js';
import { rssJSON } from './format';

export class CoreComponents {
    static create(data: rssJSON) {
        const rows: MessageActionRow[] = [];

        for (const item of data.items) {
            const button = new MessageButton()
                .setLabel('Read More')
                .setStyle(Constants.MessageButtonStyles.LINK)
                .setURL(item.link);

            const row = new MessageActionRow()
                .setComponents(button);

            rows.unshift(row);
        }

        return rows;
    }
}