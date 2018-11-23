'use strict';

const fs = require('fs');
const Speaker = require('speaker');
const record2 = require('node-record-lpcm16');
const wav = require('wav');
const Player = require('player');

const DEFAULT_SAMPLE_RATE = 22050;

const Logger = require('../logger');
const logger = new Logger('PLAYER');

let busy = false;

/**
 * Returns if the player is busy
 *
 * @return {*} boolean
 */
function isBusy() {
    return busy;
}

/**
 * Plays a mp3
 *
 * @param {*} list
 */
function playMp3(list) {
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
            logger.log('Playing completed [ item=' + item.src +' ]');
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
        player.stop();
    }
    busy = false;
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

    let file = fs.createWriteStream(fileName, {encoding: 'binary'});

    const mic = record2.start({
        threshold: 5,
        silence: 2,
        device: 'hw:1,0',
        recordProgram: 'rec',
        verbose: true,
    });

    let stream = mic.pipe(file);

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
    if (isBusy()) {
            logger.logError('Player is currently busy!');
            return;
        }

    busy = true;

    let rate = sampleRate || DEFAULT_SAMPLE_RATE;

    let speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: rate,
        // device: "hw:0,0",
        verbose: false,
    });

    speaker.on('error', function(err) {
        logger.logError('Speaker error : %s', err);
        busy = false;
        callback(err);
    });

    speaker.on('close', () => {
        busy = false;
        callback();
    });

    fs.createReadStream(file).pipe(speaker);
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

module.exports = {
    play, playMp3, stop, recordFile,
    appendWavHeader, createWavFile, isBusy,
};
