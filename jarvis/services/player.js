'use strict'

const fs = require('fs');
const Speaker = require('speaker');
const record2 = require('node-record-lpcm16');
const wav = require('wav');
const Player = require('player');

var internalPlayer;

const DEFAULT_SAMPLE_RATE = 22050;

var Logger = require('../logger');
var logger = new Logger("PLAYER");

var busy = false;

function isBusy() {
    return busy;
}

function playMp3(list) {

    logger.log("Now playing " + list.length + " item(s).");

    internalPlayer = new Player(list);
    internalPlayer.play();
    busy = true;
}

function stop() {
    if (internalPlayer) {
        internalPlayer.stop();
    }
    busy = false;
}

function recordFile(fileName, callback) {

    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }

    var file = fs.createWriteStream(fileName, { encoding: 'binary' })

    const mic = record2.start({
        threshold: 5,
        silence: 2,
        device: "hw:1,0",
        recordProgram: "rec",
        verbose: true
    });

    var stream = mic.pipe(file);

    mic.on('finish', callback);
    //stream.on('end', callback);
    //stream.on('close', callback);

}

function play(file, sampleRate) {

    var rate = sampleRate || DEFAULT_SAMPLE_RATE;

    var speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: rate,
        //device: "hw:0,0",
        verbose: true
    });

    speaker.on('error', function (err) {
        logger.logError('Speaker error : %s', err);
    });

    fs.createReadStream(file).pipe(speaker);
}

function appendWavHeader(buffer, detector) {

    var audioCommandBuffer = new Buffer(5000);

    var samplesLength = 10000;

    var header = new Buffer(1024);
    header.write('RIFF', 0);

    //file length
    header.writeUInt32LE(32 + samplesLength * 2, 4);
    header.write('WAVE', 8);

    //format chunk idnetifier
    header.write('fmt ', 12);

    //format chunk length
    header.writeUInt32LE(16, 16);

    //sample format (raw)
    header.writeUInt16LE(1, 20);

    //Channel Count
    header.writeUInt16LE(detector.numChannels(), 22);

    //sample rate
    header.writeUInt32LE(detector.sampleRate(), 24);

    //byte rate
    //header.writeUInt32LE(detector.sampleRate() * 4,28);
    header.writeUInt32LE(32000, 28);

    //block align (channel count * bytes per sample)
    header.writeUInt16LE(2, 32);

    //bits per sample
    header.writeUInt16LE(16, 34);

    //data chunk identifier
    header.write('data', 36);

    //data chunk length
    header.writeUInt32LE(15728640, 40);

    audioCommandBuffer = header.slice(0, 50);

    //Comment this out to omit the hotword chunk of audio
    audioCommandBuffer = Buffer.concat([audioCommandBuffer, buffer]);

    return audioCommandBuffer;

}

function createWavFile(buffer, fileName, callback) {
    logger.log("Creating command file. [filename=" + fileName + ']')

    var writer = new wav.FileWriter(fileName);

    writer.on('done', function () { setTimeout(callback, 1000) });
    writer.on('error', function (err) { console.error(err); });

    writer.write(buffer);
    writer.end();
}

module.exports = { play, playMp3, stop, recordFile, appendWavHeader, createWavFile, isBusy }