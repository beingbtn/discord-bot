"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeout = void 0;
const node_timers_1 = require("node:timers");
const Constants_1 = require("./Constants");
class Timeout {
    constructor(options) {
        //Timeout set when the timeout is cleared
        this.baseTimeout = options?.baseTimeout ?? Constants_1.Constants.ms.minute;
        //Holds a setTimeout Id for clearing
        this.clearTimeout = undefined;
        //Number of addError calls in the last minute
        this.lastMinute = 0;
        //Upper limit to this.timeout
        this.maxTimeout = options?.maxTimeout ?? Constants_1.Constants.ms.day / 2;
        //The value that would be used for a setTimeout
        this.pauseFor = 0;
        //Unix time for when a timeout should end
        this.resumeAfter = 0;
        //Holds the next timeout length
        this.timeout = options?.baseTimeout ?? Constants_1.Constants.ms.minute;
        //Optional value to manipulate the increase in timeout
        this.increment = options?.increment;
        //Bindings
        this.addError = this.addError.bind(this);
        this.isTimeout = this.isTimeout.bind(this);
        this.getPauseFor = this.getPauseFor.bind(this);
        this.getTimeout = this.getTimeout.bind(this);
    }
    addError() {
        this.pauseFor = this.timeout;
        this.resumeAfter = this.timeout + Date.now();
        const baseTimeout = Math.max(this.increment
            ? this.increment(this.timeout)
            : (this.timeout * 2), this.baseTimeout);
        this.timeout = Math.min(baseTimeout === 0
            ? 30000
            : baseTimeout, this.maxTimeout);
        (0, node_timers_1.clearTimeout)(this.clearTimeout);
        this.clearTimeout = (0, node_timers_1.setTimeout)(() => {
            this.pauseFor = 0;
            this.timeout = this.baseTimeout;
        }, this.timeout + 30000);
        this.lastMinute += 1;
        (0, node_timers_1.setTimeout)(() => {
            this.lastMinute -= 1;
        }, Constants_1.Constants.ms.minute);
    }
    getPauseFor() {
        return this.pauseFor;
    }
    getTimeout() {
        return this;
    }
    isTimeout() {
        return this.resumeAfter > Date.now();
    }
    resetTimeout() {
        (0, node_timers_1.clearTimeout)(this.clearTimeout);
        this.timeout = this.baseTimeout;
    }
}
exports.Timeout = Timeout;
