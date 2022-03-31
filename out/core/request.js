"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreRequest = void 0;
const HTTPError_1 = require("../utility/errors/HTTPError");
const Request_1 = require("../utility/Request");
class CoreRequest {
    constructor(client) {
        this.client = client;
    }
    async request(url) {
        const response = await new Request_1.Request(this.client.config).request(url);
        if (response.ok === false) {
            throw new HTTPError_1.HTTPError({
                response: response,
                url: url,
            });
        }
        const xml = await response.text();
        return xml;
    }
}
exports.CoreRequest = CoreRequest;
