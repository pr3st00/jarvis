'use strict';

const TAB = '\t';

/**
 * Logging stuff
 */
class Logger {
    /**
     * Constructor
     *
     * @param {*} module
     */
    constructor(module) {
        this._module = module;
        this.debug = false;
    }

    /**
     * Turns debug on and off
     *
     * @param {*} enabled
     */
    setDebug(enabled) {
        this.debug = enabled;
    }

    /**
     * Logs at regular times
     *
     * @param {*} mesg
     */
    logRestricted(mesg) {
        if (new Date().getSeconds() == 0) {
            this.log(mesg);
        }
    }

    /**
     * Logs a message
     *
     * @param {*} mesg
     */
    log(mesg) {
        console.log('[' + this.getDate() + ']' + '['
            + this._module + ']' +
            TAB.repeat(7/this._module.length + 1) + mesg);
    }

    /**
     * Logs an error message
     *
     * @param {*} mesg
     */
    logError(mesg) {
        this.log('[ERROR] ' + mesg);
    }

    /**
     * Logs a debug message
     *
     * @param {*} mesg
     */
    logDebug(mesg) {
        if (this.debug) {
            this.log('**DEBUG** ' + mesg);
        }
    }

    /**
     * Gets the current date
     *
     * @return {*} string
     */
    getDate() {
        let d = new Date();

        return ('0' + d.getDate()).slice(-2) + '-'
            + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
            + d.getFullYear() + ' '
            + ('0' + d.getHours()).slice(-2) + ':'
            + ('0' + d.getMinutes()).slice(-2) + ':'
            + ('0' + d.getSeconds()).slice(-2);
    }
}

exports = module.exports = Logger;
