"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const AbortError_1 = require("./errors/AbortError");
const Constants_1 = require("./Constants");
const node_fetch_1 = __importDefault(require("node-fetch"));
const Log_1 = require("./Log");
const node_timers_1 = require("node:timers");
class Request {
    constructor(config) {
        this.restRequestTimeout = config?.restRequestTimeout ??
            Constants_1.Constants.defaults.request.restRequestTimeout;
        this.try = 0;
        this.tryLimit = (config?.retryLimit ?? 2) + 1;
    }
    async request(url, fetchOptions) {
        this.try += 1;
        const controller = new AbortController();
        const abortTimeout = (0, node_timers_1.setTimeout)(() => controller.abort(), this.restRequestTimeout).unref();
        try {
            const response = await (0, node_fetch_1.default)(url, {
                signal: controller.signal,
                ...fetchOptions,
            });
            if (response.ok === true) {
                if (this.try > 1) {
                    Log_1.Log.request('Successfully fetched after a retry');
                }
                return response;
            }
            if (this.try < this.tryLimit &&
                response.status >= 500 &&
                response.status < 600) {
                Log_1.Log.request(`Retrying due to a response between 500 and 600: ${response.status}`);
                return this.request(url, fetchOptions);
            }
            return response;
        }
        catch (error) {
            if (this.try < this.tryLimit) {
                Log_1.Log.request('Retrying due to an AbortError');
                return this.request(url, fetchOptions);
            }
            throw new AbortError_1.AbortError({
                message: error?.message,
                url: url,
            });
        }
        finally {
            clearTimeout(abortTimeout);
        }
    }
    static tryParse(response) {
        return response
            .json()
            .catch(() => null);
    }
}
exports.Request = Request;
