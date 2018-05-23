'use strict';

/**
 * Actions
 */
class Actions {
    /**
     * Builds a action object for playing the message.
     *
     * @param {*} message
     * @return {*} json
     */
    buildPlayAction(message) {
        return {
            'actions': [
                {
                    'action': 'PLAY',
                    'parameters': [
                        message,
                    ],
                    'synchronous': true,
                },
            ],
        };
    }

    /**
     * Builds a action object for stopping
     *
     * @return {*} json
     */
    buildStopAction() {
        return {
            'actions': [
                {
                    'action': 'STOP',
                    'parameters': [
                    ],
                    'synchronous': true,
                },
            ],
        };
    }

}

exports = module.exports = Actions;
