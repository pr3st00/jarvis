'use strict';

const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;

let Logger = require('./logger');
let Jarvis = require('./jarvis');

/**
 * CORE configuration
 */
const coreConfig = require('./config/core.json');

let waitingForCommand = false;
let processingCommand = false;
let silenceEvents = 0;
let commandEvents = 0;

let FINALBUFFER = new Buffer('');
let io;
let processCommandIniTime;

let jarvis = new Jarvis();
let logger = new Logger('CORE');

/**
 * Sets an io to jarvis
 *
 * @param {*} _io
 */
function setIO(_io) {
    io = _io;
}

/**
 * Retrieves the jarvis
 *
 * @return {*} jarvis
 */
function getJarvis() {
    return jarvis;
}

jarvis.on('error', function(err) {
    logger.logError(err.message);
    io.emit('error', JSON.stringify({status: 'ERROR', text: err.message}));
    resetFlags();
});

jarvis.on('speaking', function(event) {
    io.emit('speaking', JSON.stringify(event));
});

jarvis.on('waiting_for_command', function(event) {
    io.emit('waiting_for_command', JSON.stringify(
        {status: 'WAITING', text: 'Waiting for command...'}));
});

jarvis.on('command_received', function(event) {
    io.emit('command_received', JSON.stringify(
        {status: 'GOT_COMMAND', text: event}));
});

jarvis.on('processing_command', function(event) {
    io.emit('waiting_for_command', JSON.stringify(
        {status: 'PROCESSING', text: 'Processing command...'}));
});

/**
 * Starts the core.
 */
function start() {
    jarvis.start();
    jarvis.processCommandText(coreConfig.initial_question, () => { });
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
    if (commandEvents === 0 && coreConfig.skip_first_chunk) {
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
        file: coreConfig.detector.model,
        sensitivity: coreConfig.detector.sensitivity,
        hotwords: coreConfig.detector.hotwords,
    });

    const detector = new Detector({
        resource: coreConfig.detector.resource,
        models: models,
        audioGain: coreConfig.detector.audio_gain,
        applyFrontend: coreConfig.detector.applyFrontend,
    });

    detector.on('silence', function() {
        if (waitingForCommand && processingCommand) {
            silenceEvents++;

            if (stillNotReadyForCommand()) {
                return;
            }

            processCommand();
        }
    });

    detector.on('sound', function(buffer) {
        if (waitingForCommand) {
            commandEvents++;
            processingCommand = true;

            if (stillNotReadyForCommand()) {
                saveCommandBuffer(buffer);
            } else {
                processCommand();
            }
        }
    });

    detector.on('error', function() {
        logger.logError('error');
    });

    detector.on('hotword', function(index, hotword, buffer) {
        silenceEvents = 0;

        logger.log('Hotword [' + hotword + '] received at index ['
            + index + ']');

        if (waitingForCommand) {
            saveCommandBuffer(buffer);
            return;
        }

        if (jarvis.busy || processingCommand) {
            return;
        }

        jarvis.waitForCommand();

        waitingForCommand = true;
    });

    const mic = record.start({
        threshold: 0,
        channels: 1,
        sampleRate: 16000,
        device: coreConfig.devices.mic,
        verbose: false,
    });

    mic.pipe(detector);

    logger.log('STARTED');

    if (coreConfig.logging.dumpFlags) {
        dumpFlags();
    }
}

/**
 * Saves the intermediate buffer
 *
 * @param {*} buffer
 * @param {*} finalBuffer
 * @return {*} newBuffer
 */
function saveBuffer(buffer, finalBuffer) {
    let newBuffer = Buffer.concat([finalBuffer, buffer]);
    return newBuffer;
}

/**
 * Adds a wav header to the buffer
 *
 * @param {*} buffer
 * @return {*} newBuffer
 */
function writeWavHeader(buffer) {
    let wav = require('wav');
    let writer = new wav.Writer();

    writer.write(buffer);
    writer.end();

    return Buffer.concat([writer._header, buffer]);
}

/**
 * Process command
 */
function processCommand() {
    logger.log('Processing command. [ commandEvents=' + commandEvents +
        ', silenceEvents=' + silenceEvents + ' ]');

    resetFlags();

    processCommandIniTime = new Date().getTime();

    jarvis.processCommandBuffer(writeWavHeader(FINALBUFFER), () => {
        /**
         * Total time spent for processing a command.
         */
        let totalTime = new Date().getTime() - processCommandIniTime;
        logger.log('TOTAL COMMAND PROCESSING TIME = [' + totalTime + '] ms');

        /**
         * Give it sometime for JARVIS to talk.
         * Avoid Jarvis responding to itself :-)
         */
        setTimeout(function() {
            processingCommand = false;
            FINALBUFFER = new Buffer('');
        }, coreConfig.wait_for_javis_time);
    });
}

/**
 * Verifies if the command is ready to be processed
 *
 * @return {*} boolean
 */
function stillNotReadyForCommand() {
    if (commandEvents >= coreConfig.command.max) {
        return false;
    }

    if (silenceEvents <= coreConfig.silence.min) {
        return true;
    }

    if (commandEvents < coreConfig.command.min &&
        silenceEvents <= coreConfig.silence.max
    ) {
        return true;
    }
}

/**
 * Dumps the current flags to the console
 */
function dumpFlags() {
    logger.log('STATUS [waiting_for_comand=' + waitingForCommand +
        ', processing_command=' + processingCommand + ']');
    logger.log('EVENTS [silence=' + silenceEvents + ', command=' +
        commandEvents + ']');
    setTimeout(dumpFlags, coreConfig.logging.dumpFlagsInterval);
}

/**
 * Resets all internal flags
 */
function resetFlags() {
    waitingForCommand = false;
    processingCommand = false;
    silenceEvents = 0;
    commandEvents = 0;
}

exports = module.exports = {start, setIO, getJarvis};
