'use strict';

const EventEmitter = require('events');
const player = require('./services/player')

var processor = require('./services/actionsProcessor');
var config = require('./services/config').getConfig();

var Logger = require('./logger');
var logger = new Logger("JARVIS");

// TODO: Make platform agnostic
var sttService = require('./services/watson/speechToTextService');
var dialogService = require('./services/watson/dialogService');
var NO_ANSWER_FOUND = "NO_ANSWER_FOUND";

class Jarvis extends EventEmitter {

    constructor() {
        super();
        this.busy = false;
    }

    processCommandData(buffer, callback) {

        this.busy = true;
        this.emit('processing_command');

        logger.log("Processing buffer of size: [" + buffer.byteLength + "]");

        var _jarvis = this;
        processor.setJarvis(this);

        var errorCallback = function (message) {
            callback();

            if (config.jarvis.dialogs.speak_when_not_recognized &&
                NO_ANSWER_FOUND == message) {
                _jarvis.speak(config.jarvis.dialogs.not_recognized_message);
            }

            _jarvis.onError(message);
        };

        var sucessCallback = function (text) {
            _jarvis.processCommandText(text, callback);
        };

        sttService.process(
            buffer,
            sucessCallback,
            errorCallback
        );
    }

    processCommandText(text, callback) {

        this.emit('command_received', text);

        var _jarvis = this;
        processor.setJarvis(this);

        dialogService.process(text, _jarvis,
            function (actions) {
                processor.process(actions,
                    function () {
                        callback()
                        _jarvis.onError("Error in dialog service")
                    },
                    function () {
                        callback();
                        _jarvis.busy = false;
                    });
            });

    }

    start() {
        this.init();
        this.emit('running');
    }

    waitForCommand() {
        this.emit('waiting_for_command');
        if (player.isBusy()) {
            player.stop();
            setTimeout(function () { 
                player.play(config.jarvis.waiting_for_command_wav, 44100);
            }, 2000);
        }
        else {
            player.play(config.jarvis.waiting_for_command_wav, 44100);
        }
    }

    speak(message) {
        this.emit('speaking', { status: "SPEAKING", text: message });
        var _jarvis = this;
        processor.process(processor.buildPlayAction(message),
            function () {
                _jarvis.onError("Error speaking.")
            },
            function () {
            });
    }

    onError(message) {
        this.busy = false;
        this.emit('error', new Error(message));
    }

}

exports = module.exports = Jarvis;
