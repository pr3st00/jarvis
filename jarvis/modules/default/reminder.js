'use strict';

const JarvisModule = require('../jarvisModule');
let instance;

const ADD_EVENT = 'ADD';

/**
 * Reminders module
 */
class ReminderModule extends JarvisModule {
    /**
     * Constructor
     *
     * @param {*} name
     */
    constructor(name) {
        super(name);
    }

    /**
    * Process a reminder event
    *
    * @param {*} parameters
    * @return {*} action
    */
    process(parameters) {
        let action = parameters[1];

        if (!action) {
            return this.buildPlayAction(this.config.error_message);
        }

        switch (action) {
            case ADD_EVENT:
                saveEvent(parameters[2]);
                return this.buildPlayAction(this.config.event_added_message);
                break;
            case LIST_EVENTS:
                return this.buildPlayAction(listEvents());
                break;
        }
    }
}

/**
 * Save events
 *
 * @param {*} event
 * @return {*} string
 */
function saveEvent(event) {
    return 'Lanchar.';
}

/**
 * List all events
 *
 * @return {*} string
 */
function listEvents() {
    return 'Lanchar.';
}

/**
 * Returns an instance of this class
 *
 * @param{*} moduleName
 * @return {*} instance
 */
function getInstance(moduleName) {
    if (!instance) {
        instance = new ReminderModule(moduleName);
    }
    return instance;
}

module.exports = {getInstance};
