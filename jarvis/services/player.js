'use strict';

const fs = require('fs');
const Speaker = require('speaker');
const record2 = require('node-record-lpcm16');
const wav = require('wav');
const Player = require('player');
const shellPlayer = require('play-sound')({});

const DEFAULT_SAMPLE_RATE = 22050;
const WAIT_TIME = 1000;

const Logger = require('../logger');
const logger = new Logger('PLAYER');

logger.setDebug(true);

let busy = false;
let disabled = false;
let useShell = true;

/**
 * Returns if the player is busy
 *
 * @return {*} boolean
 */
function isBusy() {
    return busy;
}

/**
 * Enables the player
 *
 */
function enable() {
    disabled = false;
}

/**
 * Disables the player
 *
 */
function disable() {
    disabled = true;
}

/**
 * Returns if the player is disabled
 *
 * @return {*} boolean
 */
function isDisabled() {
    return disabled;
}

/**
 * Plays a mp3
 *
 * @param {*} list
 */
function playMp3(list) {
    if (isDisabled()) {
        logger.logError('Player is currently disabled, no sound.');
        return;
    }

    if (isBusy()) {
        logger.logError('Player is currently busy!');
        return;
    }

    busy = true;

    logger.log('Now playing ' +
        (list instanceof Array ? list.length : 1) + ' item(s).');

    try {
        let internalPlayer = new Player(list);

        internalPlayer.on('error', function(err) {
            stop(internalPlayer);
            if (err && err.match && !err.match(/No next song was found/i)) {
                logger.logError(err);
            }
        });

        internalPlayer.on('playing', function(item) {
            logger.log('Playing [ item=' + item.src + ' ]');
        });

        internalPlayer.on('playend', function(item) {
            logger.log('Playing completed [ item=' + item.src + ' ]');
            busy = false;
        });

        internalPlayer.play();
    } catch (err) {
        logger.logError(err);
        stop(internalPlayer);
    }
}

/**
 * Stops the player
 *
 *  @param {*} player
 */
function stop(player) {
    if (player) {
        /**
         * Not beautiful, but rasp default sound driver has
         * problems playing two streams,
         * so give it sometime to finish
         */
        setTimeout(() => {
            logger.logDebug('Stopping the player');
            player.stop();
            busy = false;
        }, WAIT_TIME);
    }
}

/**
 * Records a file
 *
 * @param {*} fileName
 * @param {*} callback
 */
function recordFile(fileName, callback) {
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }

    // let file = fs.createWriteStream(fileName, {encoding: 'binary'});

    const mic = record2.start({
        threshold: 5,
        silence: 2,
        device: 'hw:1,0',
        recordProgram: 'rec',
        verbose: true,
    });

    // let stream = mic.pipe(file);

    mic.on('finish', callback);
    // stream.on('end', callback);
    // stream.on('close', callback);
}

/**
 * Plays file using the rate provided.
 *
 * @param {*} file
 * @param {*} callback
 * @param {*} sampleRate
 */
function play(file, callback, sampleRate) {
    if (isDisabled()) {
        logger.logError('Player is currently disabled, no sound.');
        callback();
        return;
    }

    while (isBusy()) {
        logger.logError('Player is currently busy!');
        callback('busy');
        return;
    }

    busy = true;

    if (useShell) {
        playUsingShell(file, callback, sampleRate);
    } else {
        playUsingSpeaker(file, callback, sampleRate);
    }
}

/**
 * Appends a wav header to the buffer
 *
 * @param {*} buffer
 * @param {*} detector
 * @return {*} newbuffer
 */
function appendWavHeader(buffer, detector) {
    let audioCommandBuffer = new Buffer(5000);

    let samplesLength = 10000;

    let header = new Buffer(1024);
    header.write('RIFF', 0);

    // file length
    header.writeUInt32LE(32 + samplesLength * 2, 4);
    header.write('WAVE', 8);

    // format chunk idnetifier
    header.write('fmt ', 12);

    // format chunk length
    header.writeUInt32LE(16, 16);

    // sample format (raw)
    header.writeUInt16LE(1, 20);

    // Channel Count
    header.writeUInt16LE(detector.numChannels(), 22);

    // sample rate
    header.writeUInt32LE(detector.sampleRate(), 24);

    // byte rate
    // header.writeUInt32LE(detector.sampleRate() * 4,28);
    header.writeUInt32LE(32000, 28);

    // block align (channel count * bytes per sample)
    header.writeUInt16LE(2, 32);

    // bits per sample
    header.writeUInt16LE(16, 34);

    // data chunk identifier
    header.write('data', 36);

    // data chunk length
    header.writeUInt32LE(15728640, 40);

    audioCommandBuffer = header.slice(0, 50);

    // Comment this out to omit the hotword chunk of audio
    audioCommandBuffer = Buffer.concat([audioCommandBuffer, buffer]);

    return audioCommandBuffer;
}

/**
 * Creates a wav file using buffer
 *
 * @param {*} buffer
 * @param {*} fileName
 * @param {*} callback
 */
function createWavFile(buffer, fileName, callback) {
    logger.log('Creating command file. [filename=' + fileName + ']');

    let writer = new wav.FileWriter(fileName);

    writer.on('done', function() {
        setTimeout(callback, 1000);
    });

    writer.on('error', function(err) {
        console.error(err);
    });

    writer.write(buffer);
    writer.end();
}

/**
 * Plays file using speaker
 *
 * @param {*} file
 * @param {*} callback
 * @param {*} sampleRate
 */
function playUsingSpeaker(file, callback, sampleRate) {
    logger.logDebug('Speaker created');

    let rate = sampleRate || DEFAULT_SAMPLE_RATE;

    let speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: rate,
        // device: 'pulse',
        verbose: debug,
    });

    speaker.on('error', function(err) {
        logger.logError('Speaker error : ' + err);
        callback(err);
        busy = false;
    });

    speaker.on('close', () => {
        logger.logDebug('Speaker closing');

        setTimeout(() => {
            callback();
            busy = false;
        }, WAIT_TIME);
    });

    stream = fs.createReadStream(file);

    stream.pipe(speaker);
}

/**
 * Plays file using shell
 *
 * @param {*} file
 * @param {*} callback
 * @param {*} sampleRate
 */
function playUsingShell(file, callback, sampleRate) {
    logger.logDebug('Shell Speaker created');

    // eslint-disable-next-line no-unused-vars
    let rate = sampleRate || DEFAULT_SAMPLE_RATE;

    shellPlayer.play(file, function(err) {
        if (err) {
            logger.logError('Shell speaker error : ' + err);
            callback(err);
            busy = false;
        } else {
            logger.logDebug('Shell speaker closing');
            callback();
            busy = false;
        }
    });
}

module.exports = {
    play, playMp3, stop, recordFile,
    appendWavHeader, createWavFile, isBusy, enable, disable, isDisabled,
};
