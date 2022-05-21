import { constants } from '../utility/constants';
import { locales } from './locales/export';

//Simple implementation of chrome's/firefox's i18n
export class i18n {
    locale: typeof locales[keyof typeof locales];
    localeName: string;

    constructor(locale?: string) {
        this.localeName = locale && locales[locale as keyof typeof locales]
            ? locale
            : constants.defaults.language;

        this.locale = locales[this.localeName as keyof typeof locales];

        //Bindings
        this.getMessage = this.getMessage.bind(this);
    }

    getMessage(
        string: keyof typeof this.locale,
        options?: (string | number | bigint)[],
    ) {
        let message = this.locale[string]?.message;

        if (message && options) {
            let index = options.length;

            for (const option of options.reverse()) {
                message = message.replaceAll(`$${index}`, String(option));
                index -= 1;
            }
        }

        return message || 'null';
    }
}