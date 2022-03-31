"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreError = void 0;
const Timeout_1 = require("../utility/Timeout");
class CoreError {
    constructor() {
        this.isGlobal = false;
        this.abort = new Timeout_1.Timeout({ baseTimeout: 0 });
        this.generic = new Timeout_1.Timeout({ baseTimeout: 30000 });
        this.http = new Timeout_1.Timeout({ baseTimeout: 30000 });
        this.addAbort = this.addAbort.bind(this);
        this.addGeneric = this.addGeneric.bind(this);
        this.addHTTP = this.addHTTP.bind(this);
        this.isTimeout = this.isTimeout.bind(this);
        this.getTimeout = this.getTimeout.bind(this);
    }
    addAbort() {
        this.abort.addError();
    }
    addGeneric() {
        this.generic.addError();
    }
    addHTTP() {
        this.http.addError();
    }
    isTimeout() {
        return (this.abort.isTimeout() ||
            this.generic.isTimeout() ||
            this.http.isTimeout());
    }
    getTimeout() {
        return this.isTimeout()
            ? Math.max(this.abort.pauseFor, this.generic.pauseFor, this.http.pauseFor)
            : 0;
    }
}
exports.CoreError = CoreError;
