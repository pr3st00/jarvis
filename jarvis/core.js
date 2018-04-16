'use strict';

const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const player = require('./services/player');

const COMMAND_TEMP_WAV = '/tmp/command#date#.wav';

/**
 * Controls how we save buffers
 */
const SILENCE_MIN_EVENTS = 5;
const SILENCE_MAX_EVENTS = 100;
const COMMAND_MIN_CHUNKS = 10;
const SKIP_FIRST_CHUNK = false;

const WAIT_FOR_JARVIS_TIME = 8000;

var waiting_for_command = false;
var processing_command = false;
var silence_events = 0;
var command_events = 0;

var FINALBUFFER = new Buffer('');
var io;

var Jarvis = require('./jarvis');
var jarvis = new Jarvis();

function setIO(_io) {
    io = _io;
}

jarvis.on('error', function (err) {

    console.log("[ERROR] " + err);

    io.emit('error', JSON.stringify({ status: "ERROR", text: err.message}));

    waiting_for_command = false;
    processing_command = false;
    silence_events = 0;
    command_events = 0;
});

jarvis.on('speaking', function (event) {
    io.emit('speaking', event);
});

jarvis.on('waiting_for_command', function (event) {
    io.emit('waiting_for_command', JSON.stringify({ status: "WAITING", text: "Waiting for command..."}));
});

jarvis.on('processing_command', function (event) {
    io.emit('waiting_for_command', JSON.stringify({ status: "PROCESSING", text: "Proccesing command..."}));
});



/**
 * Saves buffer to FINALLBUFFER
 * 
 * @param {*} buffer 
 */
function saveCommandBuffer(buffer) {
    /**
     * Skips the very first chunk after the keyword. Usually it's the beep!
     */
    if (command_events === 0 && SKIP_FIRST_CHUNK) {
        return;
    }

    console.log('[CORE] Saving command buffer.');
    FINALBUFFER = saveBuffer(buffer, FINALBUFFER);

    command_events++;
    processing_command = true;
}

/**
 * Uses snowboy for hotwork detection and calls jarvis when needed
 */
function startHotWordDetector() {

    const models = new Models();

    models.add({
        file: 'jarvis/resources/jarvis-ptbr.pmdl',
        sensitivity: '0.90',
        hotwords: 'jarvis'
    });

    const detector = new Detector({
        resource: "jarvis/resources/common.res",
        models: models,
        audioGain: 2.0
    });

    detector.on('silence', function () {
        if (waiting_for_command && processing_command) {

            if (stillNotReadyForCommand()) {
                return;
            }

            processCommand();
        }

        if (new Date().getSeconds() == 0) {
            console.log('[CORE] Silence. [waiting_for_comand=' + waiting_for_command + ', processing_command=' + processing_command + ', events = ' + silence_events + ']');
        }
    });

    detector.on('sound', function (buffer) {
        silence_events = 0;

        if (waiting_for_command) {
            saveCommandBuffer(buffer);
        }
        else {
            console.log('[CORE] Sound detected.');
        }
    });

    detector.on('error', function () {
        console.log('[ERROR] error');
    });

    detector.on('hotword', function (index, hotword, buffer) {
        silence_events = 0;

        console.log('[CORE] Hotword [' + hotword + "] received at index [" + index + "]");

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
        sampleRate: 48000,
        device: "hw:1,0",
        verbose: false
    });

    mic.pipe(detector);

    logStatus('wating_hotword');

}

function saveBuffer(buffer, finalBuffer) {
    var newBuffer = Buffer.concat([finalBuffer, buffer]);
    return newBuffer;
}

function logStatus(event) {
    console.log("[STATUS] " + event);
}

function processCommand() {
    command_events = 0;
    waiting_for_command = false;

    var commandFile = COMMAND_TEMP_WAV.replace('#date#', Date.now());

    console.log("[CORE] Processing command.");
    player.createWavFile(FINALBUFFER, commandFile,
        function () {
            jarvis.processCommandFile(commandFile, function () {
                /**
                 * Give it sometime for JARVIS to talk.
                 * Avoid Jarvis responding to itself :-)
                 */
                setTimeout(function () {
                    processing_command = false;
                    FINALBUFFER = new Buffer('');
                }, WAIT_FOR_JARVIS_TIME);
            });
        });

}

function stillNotReadyForCommand() {
    if (silence_events++ <= SILENCE_MIN_EVENTS) {
        return true;
    }

    if (command_events < COMMAND_MIN_CHUNKS &&
        silence_events <= SILENCE_MAX_EVENTS
    ) {
        return true;
    }

}

exports = module.exports = { startHotWordDetector, setIO };
