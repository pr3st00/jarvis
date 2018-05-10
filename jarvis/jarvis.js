'use strict';

const EventEmitter = require('events');
const player = require('./services/player');

const processor = require('./services/actionsProcessor');
const config = require('./services/config').getConfig();

const Logger = require('./logger');
const logger = new Logger('JARVIS');

// TODO: Make platform agnostic
const sttService = require('./services/watson/speechToTextService');
const dialogService = require('./services/watson/dialogService');
const NO_ANSWER_FOUND = 'NO_ANSWER_FOUND';

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
    }

    /**
     * Process a command buffer.
     *
     * @param {*} buffer
     * @param {*} callback
     */
    processCommandBuffer(buffer, callback) {
        this.busy = true;
        this.emit('processing_command');

        logger.log('Processing buffer of size: [' + buffer.byteLength + ']');

        let _jarvis = this;
        processor.setJarvis(this);

        let errorCallback = function(message) {
            callback();

            if (config.jarvis.dialogs.speak_when_not_recognized &&
                NO_ANSWER_FOUND == message) {
                _jarvis.speak(config.jarvis.dialogs.not_recognized_message);
            }

            _jarvis.onError(message);
        };

        let sucessCallback = function(text) {
            _jarvis.processCommandText(text, callback);
        };

        sttService.process(
            buffer,
            sucessCallback,
            errorCallback
        );
    }

    /**
     * Process a command included on text.
     *
     * @param {*} text
     * @param {*} callback
     */
    processCommandText(text, callback) {
        this.emit('command_received', text);

        let _jarvis = this;
        processor.setJarvis(this);

        dialogService.process(text, _jarvis,
            function(actions) {
                processor.process(actions,
                    function(err) {
                        callback();
                        _jarvis.onError('Error in dialog service: ' + err);
                    },
                    function() {
                        callback();
                        _jarvis.busy = false;
                    });
            });
    }

    /**
     * Starts jarvis.
     *
     */
    start() {
        this.init();
        this.emit('running');
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
                player.play(config.jarvis.waiting_for_command_wav, 44100);
            }, 2000);
        } else {
            player.play(config.jarvis.waiting_for_command_wav, 44100);
        }
    }

    /**
     * Speaks the message
     *
     * @param {*} message
     */
    speak(message) {
        this.emit('speaking', {status: 'SPEAKING', text: message});
        let _jarvis = this;
        processor.process(processor.buildPlayAction(message),
            function() {
                _jarvis.onError('Error speaking.');
            },
            function() {
            });
    }

    /**
     * Error handler
     *
     * @param {*} message
     */
    onError(message) {
        this.busy = false;
        this.emit('error', new Error(message));
    }
}

exports = module.exports = Jarvis;
