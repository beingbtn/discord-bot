"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionLocales = exports.locales = void 0;
const Constants_1 = require("../utility/Constants");
const en_US_json_1 = __importDefault(require("./en-US.json"));
exports.locales = {
    'en-US': en_US_json_1.default,
};
class RegionLocales {
    static locale(locale) {
        let locale2 = locale ?? Constants_1.Constants.defaults.language;
        if (!Object.keys(exports.locales).includes(locale2)) {
            locale2 = Constants_1.Constants.defaults.language;
        }
        return exports.locales[locale2];
    }
    static replace(input, parameters) {
        let replaced = input;
        for (const parameter in parameters) {
            //@ts-expect-error hasOwn not implemented in typings.
            if (Object.hasOwn(parameters, parameter)) {
                const regex = new RegExp(`{{ ${parameter} }}`, 'g');
                replaced = replaced.replaceAll(regex, String(parameters[parameter]));
            }
        }
        return replaced;
    }
}
exports.RegionLocales = RegionLocales;
