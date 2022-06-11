import { Base } from '../structures/Base';
import {
    Constants,
    MessageActionRow,
    MessageButton,
} from 'discord.js';
import { type rssJSON } from './Format';

export class Components extends Base {
    public create(data: rssJSON) {
        const rows: MessageActionRow[] = [];

        for (const item of data.items) {
            const button = new MessageButton()
                .setLabel(
                    this.container.i18n.getMessage(
                        'coreComponentsButtonsReadMoreLabel',
                    ),
                )
                .setStyle(Constants.MessageButtonStyles.LINK)
                .setURL(item.link);

            const row = new MessageActionRow()
                .setComponents(button);

            rows.unshift(row);
        }

        return rows;
    }
}