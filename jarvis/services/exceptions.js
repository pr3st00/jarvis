'use strict';

/**
 * Represents any errors with services
 *
 */
class ActionServiceError extends Error {
    /**
     * Constructor
     *
     * @param {*} message
     */
    constructor(message) {
        super(message);
    }
}

module.exports = {ActionServiceError};
