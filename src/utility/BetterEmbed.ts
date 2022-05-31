import {
    MessageEmbed,
    EmbedFieldData,
    BaseCommandInteraction,
} from 'discord.js';

type Footer =
    | {
        text: string,
        iconURL?: string,
      }
    | BaseCommandInteraction;

export class BetterEmbed extends MessageEmbed {
    constructor(footer?: Footer) {
        super();
        this.setTimestamp();

        if (footer instanceof BaseCommandInteraction) {
            const interaction = footer;
            const avatar = interaction.user.displayAvatarURL({
                dynamic: true,
            });

            this.setFooter({
                text: `/${interaction.commandName}`,
                iconURL: avatar,
            });
        } else if (typeof footer !== 'undefined') {
            this.setFooter({
                text: footer.text,
                iconURL: footer.iconURL,
            });
        }
    }

    setField(name: string, value: string, inline?: boolean | undefined) {
        this.setFields({
            name: name,
            value: value,
            inline: inline,
        });

        return this;
    }

    unshiftField(
        name: string,
        value: string,
        inline?: boolean | undefined,
    ): this {
        this.unshiftFields({
            name: name,
            value: value,
            inline: inline,
        });

        return this;
    }

    unshiftFields(...fields: EmbedFieldData[] | EmbedFieldData[][]) {
        this.fields.unshift(
            ...MessageEmbed.normalizeFields(
                ...fields,
            ),
        );

        return this;
    }
}