import { locales } from './locales/main';
import { Options } from '../utility/Options';

//Simple implementation of Chrome's/Firefox's i18n
export class i18n {
    locale: typeof locales[keyof typeof locales];
    localeName: string;

    public constructor(locale?: string) {
        this.localeName = locale && locales[locale as keyof typeof locales]
            ? locale
            : Options.defaultLocale;

        this.locale = locales[this.localeName as keyof typeof locales];

        //Bindings
        this.getMessage = this.getMessage.bind(this);
    }

    public getMessage(
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