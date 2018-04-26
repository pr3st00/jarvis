'use strict';

/**
 * Logging stuff
 * 
 */
class Logger {

    constructor(module) {
        this._module = module;
    }

    logRestricted(mesg) {
        if (new Date().getSeconds() == 0) {
            this.log(mesg);
        }
    }

    log(mesg) {
        console.log("[" + this.getDate() + "]" + "["
            + this._module + "] " + mesg);
    }

    logError(mesg) {
        this.log("[ERROR] " + mesg);
    }

    getDate() {
        var d = new Date();

        return ("0" + d.getDate()).slice(-2) + "-"
            + ("0" + (d.getMonth() + 1)).slice(-2) + "-"
            + d.getFullYear() + " "
            + ("0" + d.getHours()).slice(-2) + ":"
            + ("0" + d.getMinutes()).slice(-2) + ":"
            + ("0" + d.getSeconds()).slice(-2);

    }
}

exports = module.exports = Logger;
