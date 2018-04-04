'use strict'

class ActionServiceError extends Error {
    constructor(message) {
        super(message);
    }
}

module.exports = ActionServiceError;