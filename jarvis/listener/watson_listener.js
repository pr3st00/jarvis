'use strict';

const record = require('node-record-lpcm16');

let Logger = require('./logger');
let Jarvis = require('./jarvis');

/**
 * CORE configuration
 */
const coreConfig = require('./config/core.json');

let io;
let sessionId;
let processCommandIniTime;

let jarvis = Jarvis.getInstance();
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
 * Sets the session id
 *
 * @param {*} id
 */
function setSessionId(id) {
    sessionId = id;
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
            FINALBUFFER = Buffer.from('');
        }, coreConfig.wait_for_javis_time);
    });
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

exports = module.exports = {start, setIO, getJarvis, setSessionId};
