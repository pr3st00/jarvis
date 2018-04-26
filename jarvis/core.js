'use strict';

const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const player = require('./services/player');

var Logger = require('./logger');
var Jarvis = require('./jarvis');

const INITIAL_QUESTION = "O que voce pode fazer?";

/**
 * CORE configuration
 */
var core_config = {
    silence: {
        min: 5,
        max: 50
    },
    command: {
        min: 10,
        max: 30
    },
    logging: {
        dumpFlags: true,
        dumpFlagsInterval: 30000
    },
    devices: {
        mic: "hw:1,0"
    },
    skip_first_chunk: false,
    wait_for_javis_time: 5000,
    detector: {
        sensitivity: 0.65,
        audio_gain: 8.0,
        model: 'jarvis/resources/jarvis.umdl'
    }
};

var waiting_for_command = false;
var processing_command = false;
var silence_events = 0;
var command_events = 0;

var FINALBUFFER = new Buffer('');
var io;
var processCommandIniTime;

var jarvis = new Jarvis();
var logger = new Logger("CORE");

function setIO(_io) {
    io = _io;
}

jarvis.on('error', function (err) {
    logger.logError(err.message);
    io.emit('error', JSON.stringify({ status: "ERROR", text: err.message }));
    resetFlags();

});

jarvis.on('speaking', function (event) {
    io.emit('speaking', JSON.stringify(event));
});

jarvis.on('waiting_for_command', function (event) {
    io.emit('waiting_for_command', JSON.stringify({ status: "WAITING", text: "Waiting for command..." }));
});

jarvis.on('command_received', function (event) {
    io.emit('command_received', JSON.stringify({ status: "GOT_COMMAND", text: event }));
});

jarvis.on('processing_command', function (event) {
    io.emit('waiting_for_command', JSON.stringify({ status: "PROCESSING", text: "Proccesing command..." }));
});

/**
 * Starts the core.
 */
function start() {
    jarvis.processCommandText(INITIAL_QUESTION, function () { });
    startHotWordDetector();
}

/**
 * Saves buffer to FINALLBUFFER
 * 
 * @param {*} buffer 
 */
function saveCommandBuffer(buffer) {
    /**
     * Skips the very first chunk after the keyword. Usually it's the beep!
     */
    if (command_events === 0 && core_config.skip_first_chunk) {
        return;
    }

    logger.log('Saving command buffer.');
    FINALBUFFER = saveBuffer(buffer, FINALBUFFER);
}

/**
 * Uses snowboy for hotwork detection and calls jarvis when needed
 */
function startHotWordDetector() {

    const models = new Models();

    models.add({
        file: core_config.detector.model,
        sensitivity: [core_config.detector.sensitivity, core_config.detector.sensitivity],
        hotwords: ['Jarvis', 'Jarvis']
    });

    const detector = new Detector({
        resource: "jarvis/resources/common.res",
        models: models,
        audioGain: core_config.detector.audio_gain,
        applyFrontend: true
    });

    detector.on('silence', function () {
        if (waiting_for_command && processing_command) {
            silence_events++;

            if (stillNotReadyForCommand()) {
                return;
            }

            processCommand();
        }

        logger.log('Silence.');
    });

    detector.on('sound', function (buffer) {
        silence_events = 0;

        if (waiting_for_command) {
            command_events++;
            processing_command = true;

            if (stillNotReadyForCommand()) {
                saveCommandBuffer(buffer);
            }
            else {
                processCommand();
            }
        }
        else {
            logger.logRestricted('Sound.');
        }
    });

    detector.on('error', function () {
        logger.logError('error');
    });

    detector.on('hotword', function (index, hotword, buffer) {
        silence_events = 0;

        logger.log('Hotword [' + hotword + "] received at index [" + index + "]");

        if (waiting_for_command) {
            saveCommandBuffer(buffer);
            return;
        }

        if (jarvis.busy || processing_command) {
            return;
        }

        jarvis.waitForCommand();

        waiting_for_command = true;
    });

    const mic = record.start({
        threshold: 0,
        channels: 1,
        sampleRate: 16000,
        device: core_config.devices.mic,
        verbose: false
    });

    mic.pipe(detector);

    logger.log('STARTED');

    if (core_config.logging.dumpFlags) {
        dumpFlags();
    }
}

function saveBuffer(buffer, finalBuffer) {
    var newBuffer = Buffer.concat([finalBuffer, buffer]);
    return newBuffer;
}

function processCommand() {
    command_events = 0;
    waiting_for_command = false;

    logger.log("Processing command.");

    processCommandIniTime = new Date().getTime();

    jarvis.processCommandData(FINALBUFFER, function () {

        /**
         * Total time spent for procesing a command.
         */
        var totalTime = new Date().getTime() - processCommandIniTime;
        logger.log("TOTAL COMMAND PROCESSING TIME = [" + totalTime + "] ms");

        /**
         * Give it sometime for JARVIS to talk.
         * Avoid Jarvis responding to itself :-)
         */
        setTimeout(function () {
            processing_command = false;
            FINALBUFFER = new Buffer('');
        }, core_config.wait_for_javis_time);
    });

}

function stillNotReadyForCommand() {
    if (command_events >= core_config.command.max) {
        return false;
    }

    if (silence_events <= core_config.silence.min) {
        return true;
    }

    if (command_events < core_config.command.min &&
        silence_events <= core_config.silence.max
    ) {
        return true;
    }

}

function dumpFlags() {
    logger.log('STATUS [waiting_for_comand=' + waiting_for_command + ', processing_command=' + processing_command + ']');
    logger.log('EVENTS [silence=' + silence_events + ', command=' + command_events + ']');
    setTimeout(dumpFlags, core_config.logging.dumpFlagsInterval);
}

function resetFlags() {
    waiting_for_command = false;
    processing_command = false;
    silence_events = 0;
    command_events = 0;
}

exports = module.exports = { start, setIO };
