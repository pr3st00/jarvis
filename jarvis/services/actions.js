'use strict';

/**
 * Actions Builder
 */
class Actions {
    /**
     *
     * @param {*} action
     * @param {*} parameters
     * @return {*} action
     */
    buildAction(action, parameters) {
        return {
            'action': action,
            'parameters': parameters,
            'synchronous': true,
        };
    }

    /**
     * Builds a action object for playing the message.
     *
     * @param {*} message
     * @return {*} json
     */
    buildPlayAction(message) {
        let actionsList = this.buildActionsList();

        actionsList.actions.push(
            this.buildAction('PLAY', [message]));

        return actionsList;
    }

    /**
     * Builds a action object for stopping
     *
     * @return {*} json
     */
    buildStopAction() {
        let actionsList = this.buildActionsList();

        actionsList.actions.push(
            this.buildAction('STOP', []));

        return actionsList;
    }

    /**
     *
     * @return {*} actions
     */
    buildActionsList() {
        return {
            'actions': [
            ],
        };
    }
}

exports = module.exports = Actions;
