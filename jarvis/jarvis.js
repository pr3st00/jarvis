'use strict';

const EventEmitter = require('events');
const player = require('./services/player')

var processor = require('./services/actionsProcessor');
var config = require('./services/config').getConfig();

// TODO: Make platform agnostic
var sttService = require('./services/watson/speechToTextService');
var dialogService = require('./services/watson/dialogService');

const WAITING_FOR_COMMAND_WAV = "./jarvis/resources/ding.wav";

var emitter = new EventEmitter();

class Jarvis extends EventEmitter {

    constructor() {
        super();
        this.busy = false;
    }

    processCommandFile(fileNameOrdata, callback) {

        this.busy = true;
        this.emit('processing_command');

        var _jarvis = this;
        processor.setJarvis(this);

        var errorCallback = function (message) {
            callback();
            _jarvis.onError(message);
        };

        var sucessCallback = function (text) {
            _jarvis.emit('command_received', text);
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
        };

        sttService.process(
            fileNameOrdata,
            sucessCallback,
            errorCallback
        );
    }

    start() {
        this.init();
        this.emit('running');
    }

    waitForCommand() {
        this.emit('waiting_for_command');
        player.play(WAITING_FOR_COMMAND_WAV);
    }

    speak(message) {
        this.emit('speaking', { status: SPEAKING, text: message });
        processor.process(processor.buildPlayAction(message), this.onError("Error speaking."));
    }

    onError(message) {
        this.busy = false;
        this.emit('error', new Error(message));
    }

}

exports = module.exports = Jarvis;
