'use strict';

const record = require('node-record-lpcm16');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

let Logger = require('../logger');

/**
 * CORE configuration
 */
const coreConfig = require('../config/core.json');

let io;
let sessionId;
let processCommandIniTime;

let jarvis;
let processingCommand = false;
let logger = new Logger('WLISTENER');

logger.setDebug(true);

/**
 * Sets an io to jarvis
 *
 * @param {*} _io
 */
function setIO(_io) {
    io = _io;
}

/**
 * Set jarvis
 *
 * @param {*} _jarvis
 */
function setJarvis(_jarvis) {
    jarvis = _jarvis;
}

/**
 * Retrieves the jarvis
 *
 * @return {*} jarvis
 */
function getJarvis() {
    return jarvis;
}

/**
 * Setup events and connect them to the socket.io
 */
function setupEvents() {
    jarvis.on('error', function(err) {
        logger.logError(err.message);
        io.to(sessionId).emit('error',
            JSON.stringify({status: 'ERROR', text: err.message}));
        resetFlags();
    });

    jarvis.on('speaking', function(event) {
        io.to(sessionId).emit('speaking', JSON.stringify(event));
    });

    jarvis.on('waiting_for_command', function(event) {
        io.to(sessionId).emit('waiting_for_command', JSON.stringify(
            {status: 'WAITING', text: 'Waiting for command...'}));
    });

    jarvis.on('command_received', function(event) {
        io.to(sessionId).emit('command_received', JSON.stringify(
            {status: 'GOT_COMMAND', text: event}));
    });

    jarvis.on('processing_command', function(event) {
        io.to(sessionId).emit('waiting_for_command', JSON.stringify(
            {status: 'PROCESSING', text: 'Processing command...'}));
    });

    jarvis.on('understood_command', function(event) {
        io.to(sessionId).emit('understood_command', JSON.stringify(event));
    });
}

/**
 * Starts the core.
 */
function start() {
    jarvis.start();
    setupEvents();
    jarvis.processCommandText(coreConfig.initial_question, () => { });
    listen();
}

/**
 * Listen for commands
 */
function listen() {
    const mic = record.start({
        threshold: 0,
        channels: 1,
        sampleRate: 16000,
        device: coreConfig.devices.mic,
        verbose: false,
    });

    let servicesConfig = jarvis.getConfig('services');
    let name = jarvis.getConfig('name');
    let nameRegex = '^.*' + name + ' ?';
    let sttConfig = servicesConfig.watson.speech_to_text;

    let stt = new SpeechToTextV1({
        username: sttConfig.username,
        password: sttConfig.password,
    });

    const webSocketparams = {
        content_type: 'audio/wav',
        timestamps: false,
        interim_results: true,
        model: sttConfig.model,
        inactivity_timeout: -1,
        acoustic_customization_id: sttConfig.acoustic_customization_id,
    };

    let sttStream = stt.createRecognizeStream(webSocketparams);
    sttStream.setEncoding('utf8');

    sttStream.on('error', function(err) {
        if (err) {
            logger.logError(err);
            record.stop();
            listen();
        }
    });

    sttStream.on('data', function(text) {
        logger.logDebug('Got text: ' + text);
        if (!processingCommand && !jarvis.busy) {
            if (text.includes(name)) {
                processingCommand = true;
                processCommand(text.replace(new RegExp(nameRegex, 'g'), ''));
            }
        }
    });

    mic.pipe(sttStream);
}

/**
 * Process command
 *
 * @param{*} text
 */
function processCommand(text) {
    logger.log('Processing command.');

    processCommandIniTime = new Date().getTime();

    jarvis.processCommandText(text.replace(/ +$/, ''), () => {
        /**
         * Total time spent for processing a command.
         */
        let totalTime = new Date().getTime() - processCommandIniTime;
        logger.log('TOTAL COMMAND PROCESSING TIME = [' + totalTime + '] ms');
        processingCommand = false;
    });
}

exports = module.exports = {start, setIO, getJarvis, setJarvis};
