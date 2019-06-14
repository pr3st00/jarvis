'use strict';

const EventEmitter = require('events');
const player = require('./services/player');

const Actions = require('./services/actions');
const actions = new Actions();

const Processor = require('./services/actionsProcessor');
const listener = require('./listener/watson_listener');

const config = require('./services/config').getConfig();

const Logger = require('./logger');
const logger = new Logger('JARVIS');

const NO_ANSWER_FOUND = 'NO_ANSWER_FOUND';

let instance;

/**
 * Jarvis
*/
class Jarvis extends EventEmitter {
    /**
     * Constructor
     */
    constructor() {
        super();
        this.busy = false;
        this.processor = new Processor();
        this.processor.setJarvis(this);
    }

    /**
     * Process a command buffer.
     *
     * @param {Object} buffer
     * @param {Object} callback
     */
    processCommandBuffer(buffer, callback) {
        this.busy = true;
        this.emit('processing_command');

        logger.log(`Processing buffer of size: [${buffer.byteLength}]`);

        let _jarvis = this;

        let errorCallback = function(message) {
            callback();

            if (config.jarvis.dialogs.speak_when_not_recognized &&
                NO_ANSWER_FOUND == message) {
                _jarvis.speak(config.jarvis.dialogs.not_recognized_message);
            }

            _jarvis.onError(message);
        };

        this.processor.processCommandBuffer(buffer,
        () => {
            callback();
            _jarvis.busy = false;
        },
        errorCallback);
    }

    /**
     * Process a command included on text.
     *
     * @param {String} text
     * @param {Object} callback
     */
    processCommandText(text, callback) {
        this.emit('command_received', text);

        let _jarvis = this;

        this.processor.processCommandText(text,
            () => {
                callback();
                _jarvis.busy = false;
            },
            (err) => {
                callback();
                _jarvis.onError(`Error processing text command: ${err}`);
            });
    }

    /**
     * Starts jarvis.
     *
     */
    start() {
        this.emit('running');
        logger.log(`Using implementation: [${config.jarvis.processor}]`);
    }

    /**
     * Plays the bip wav sound and starts waiting for a command.
     *
     */
    waitForCommand() {
        this.emit('waiting_for_command');
        if (player.isBusy()) {
            player.stop();
            setTimeout(function() {
                player.play(config.jarvis.waiting_for_command_wav,
                    () => {}, 44100);
            }, 2000);
        } else {
            player.play(config.jarvis.waiting_for_command_wav, () => {}, 44100);
        }
    }

    /**
     * Process all the actions under the parameter action
     *
     * @param {Object} actions
     * @param {Object} errorCallback
     * @param {Object} sucessCallBack
     */
    processActions(actions, errorCallback, sucessCallBack) {
        let _jarvis = this;
        this.processor.process(actions,
            (err) => {
                _jarvis.onError(`Error processing actions: ${err}`);
                errorCallback(err);
            },
            () => {
                sucessCallBack();
            });
    }

    /**
     * Speaks the message
     *
     * @param {String} message
     */
    speak(message) {
        this.emit('speaking', {status: 'SPEAKING', text: message});
        let _jarvis = this;
        this.processor.process(actions.buildPlayAction(message),
            (err) => {
                _jarvis.onError(`Error speaking: ${err}`);
            },
            () => {
            });
    }

    /**
     * Listen to commands
     *
     */
    listen() {
        this.emit('listening');
        listener.setJarvis(this);
        listener.start();
    }

    /**
     * Error handler
     *
     * @param {String} message
     */
    onError(message) {
        this.busy = false;
        this.emit('error', new Error(message));
    }

    /**
     * Returns the current value of this config
     *
     * @param {String} key
     * @return {String} config value
     */
    getConfig(key) {
        return config.jarvis[key];
    }

    /**
     * Sets the sessionId
     *
     * @param {String} id
     */
    setSessionId(id) {
        this.sessionId = id;
    }

    /**
     * Retrieves the sessionId
     *
     * @return {String} session id
     */
    getSessionId() {
        return this.sessionId;
    }
}

/**
 * Returns a singleton of Jarvis
 *
 * @return {Jarvis} Jarvis
 */
function getInstance() {
    if (!instance) {
        instance = new Jarvis();
    }

    return instance;
}

exports = module.exports = {getInstance};
