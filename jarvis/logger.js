'use strict';

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
            + this._module + '] ' + mesg);
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
