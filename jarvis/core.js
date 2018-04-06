'use strict';

const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const EventEmitter = require('events');

var processor = require('./services/actionsProcessor');
var config = require('./services/config').getConfig();
var player = require('./services/player');

// TODO: Make platform agnostic
var sttService = require('./services/watson/speechToTextService');
var dialogService = require('./services/watson/dialogService');

var emitter = new EventEmitter();
var jarvis = {};

const WAITING_FOR_COMMAND_WAV = "./jarvis/resources/ding.wav";
const COMMAND_TEMP_WAV = '/tmp/command.wav';

jarvis.init = function () {
    this.busy = false;
    emitter = new EventEmitter();
}

jarvis.listen = function () {
    emitAndLog('listening');
    player.recordFile(
        COMMAND_TEMP_WAV,
        function () {
            sttService.process(
                COMMAND_TEMP_WAV,
                function (text) {
                    dialogService.process(text,
                        function (actions) {
                            /**
                             * Process all actions and then listens
                             * for keyword again
                             */
                            processor.process(actions, onError);
                            waitForHotWord();
                        });
                    }, 
                    function(message) { onError(message); }
            )
        }
    );
}

jarvis.start = function () {
    this.init();
    //jarvis.processCommand();
    waitForHotWord();
    emitAndLog('running');
}

jarvis.on = function (event, callback) {
    emitter.on(event, callback);
}

jarvis.processCommand = function () {
    if (!jarvis.busy) {
        jarvis.busy = true;

        emitAndLog('hotword');

        player.play(WAITING_FOR_COMMAND_WAV);
        jarvis.listen();
    }

}

jarvis.speak = function (text) {
    emitter.emit('speaking', text);
    processor.process(processor.buildPlayAction(text), onError);
}

function onError(message) {
    console.error(message || config.jarvis.dialogs.not_recognized);
    //emitter.emit('error');
    waitForHotWord();
}

function waitForHotWord() {

    const models = new Models();

    jarvis.busy = false;

    models.add({
        file: 'jarvis/resources/jarvis-ptbr.pmdl',
        sensitivity: '0.40',
        hotwords: 'jarvis'
    });

    const detector = new Detector({
        resource: "jarvis/resources/common.res",
        models: models,
        audioGain: 2.0
    });

    detector.on('silence', function () {
        if (new Date().getSeconds() == 0) {
            console.log('..silence..');
        }
    });

    detector.on('sound', function (buffer) {
        console.log('Sound detected.');
    });

    detector.on('error', function () {
        console.log('error');
    });

    detector.on('hotword', function (index, hotword, buffer) {
        console.log('Hotword [' + hotword + "] received at index [" + index + "]");
        record.stop()
        jarvis.processCommand();
    });

    const mic = record.start({
        threshold: 0,
        device: "hw:1,0",
        verbose: false
    });

    mic.pipe(detector);

}

function emitAndLog(event) {
    console.log("Emmiting event: [" + event + "]");
    emitter.emit(event);

}
exports = module.exports = jarvis;
