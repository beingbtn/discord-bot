import { client } from '../main';
import {
    Constants,
    MessageActionRow,
    MessageButton,
} from 'discord.js';
import { rssJSON } from './CoreFormat';

export class CoreComponents {
    static create(data: rssJSON) {
        const rows: MessageActionRow[] = [];

        for (const item of data.items) {
            const button = new MessageButton()
                .setLabel(client.i18n.getMessage(
                    'coreComponentsButtonsReadMoreLabel',
                ))
                .setStyle(Constants.MessageButtonStyles.LINK)
                .setURL(item.link);

            const row = new MessageActionRow()
                .setComponents(button);

            rows.unshift(row);
        }

        return rows;
    }
}