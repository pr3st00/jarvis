'use strict';

const TAB = '\t';

/**
 * Logging stuff
 */
class Logger {
    /**
     * Constructor
     *
     * @param {String} module
     */
    constructor(module) {
        this._module = module;
        this.debug = false;
    }

    /**
     * Turns debug on and off
     *
     * @param {Boolean} enabled
     */
    setDebug(enabled) {
        this.debug = enabled;
    }

    /**
     * Logs at regular times
     *
     * @param {String} mesg
     */
    logRestricted(mesg) {
        if (new Date().getSeconds() == 0) {
            this.log(mesg);
        }
    }

    /**
     * Logs a message
     *
     * @param {String} mesg
     */
    log(mesg) {
        console.log(this.format(mesg));
    }

    /**
     * Logs an error message
     *
     * @param {*} mesg
     */
    logError(mesg) {
        console.error(this.format(`[ERROR] ${mesg}`));
    }

    /**
     * Logs a debug message
     *
     * @param {String} mesg
     */
    logDebug(mesg) {
        if (this.debug) {
            console.warn(this.format(`**DEBUG** ${mesg}`));
        }
    }

    /**
     * Formats mesg for logging
     *
     * @param {String} mesg
     * @return {String} formatted message
     */
    format(mesg) {
        // eslint-disable-next-line max-len
        return `[${this.getDate()}][${this._module}] ${TAB.repeat(7/this._module.length + 1) + mesg}`;
    }

    /**
     * Gets the current date
     *
     * @return {String} string
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
