import { Constants } from '../utility/Constants';
import { locales } from './locales/export';

//Simple implementation of chrome's/firefox's i18n
export class i18n {
    locale: typeof locales[keyof typeof locales];
    localeName: string;

    constructor(locale: string) {
        this.localeName = locale;
        this.locale = locales[locale as keyof typeof locales] ??
            locales[Constants.defaults.language as keyof typeof locales]!;
    }

    getMessage(
        string: keyof typeof this.locale,
        options?: (string | number)[],
    ) {
        let message = this.locale[string]?.message;

        if (message && options) {
            let index = options.length;

            for (const option of options.reverse()) {
                message = message.replaceAll(`$${index}`, String(option));
                index -= 1;
            }
        }

        return message ?? 'null';
    }

    getLocale() {
        return this.locale;
    }
}