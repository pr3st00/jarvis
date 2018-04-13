'use strict';

const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const EventEmitter = require('events');
const fs = require('fs');
const player = require('./services/player')

const COMMAND_TEMP_WAV = '/tmp/command#date#.wav';
const WAITING_FOR_COMMAND_WAV = "./jarvis/resources/ding.wav";

/**
 * Controls how we save buffers
 */
const SILENCE_MIN_EVENTS = 5;
const SILENCE_MAX_EVENTS = 100;
const COMMAND_MIN_CHUNKS = 10;
const SKIP_FIRST_CHUNK = false;

const WAIT_FOR_JARVIS_TIME = 8000;

var waiting_for_command = false;
var command_received = false;
var silence_events = 0;
var command_events = 0;

var FINALBUFFER = new Buffer('');
var emitter = new EventEmitter();

var jarvis = require('./jarvis');
jarvis.init();

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
    command_received = true;
}

function startHotWordDetector() {

    const models = new Models();

    models.add({
        file: 'jarvis/resources/jarvis-ptbr.pmdl',
        sensitivity: '0.50',
        hotwords: 'jarvis'
    });

    const detector = new Detector({
        resource: "jarvis/resources/common.res",
        models: models,
        audioGain: 2.0
    });

    detector.on('silence', function () {
        if (waiting_for_command && command_received) {

            if (silence_events++ <= SILENCE_MIN_EVENTS) {
                return;
            }

            if (command_events < COMMAND_MIN_CHUNKS &&
                silence_events <= SILENCE_MAX_EVENTS
            ) {
                return;
            }

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
                            command_received = false;
                            FINALBUFFER = new Buffer('');
                        }, WAIT_FOR_JARVIS_TIME);
                    });
                });
        }

        if (new Date().getSeconds() == 0) {
            console.log('[CORE] Silence. [waiting_for_comand=' + waiting_for_command + ', command_received=' + command_received + ', events = ' + silence_events + ']');
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

        if (waiting_for_command) {
            saveCommandBuffer(buffer);
            return;
        }

        if (command_received) {
            return;
        }

        console.log('[CORE] Hotword [' + hotword + "] received at index [" + index + "]");
        player.play(WAITING_FOR_COMMAND_WAV);

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

    emitAndLog('wating_hotword');

}

function saveBuffer(buffer, finalBuffer) {
    var newBuffer = Buffer.concat([finalBuffer, buffer]);
    return newBuffer;
}

function emitAndLog(event) {
    console.log("[EVENT] " + event);
    emitter.emit(event);
}

exports = module.exports = { startHotWordDetector };
