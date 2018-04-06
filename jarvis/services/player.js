'use strict'

var fs = require('fs');
var Speaker = require('speaker');
var record2 = require('node-record-lpcm16');

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

function play(file) {

    var speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 22050,
        device: "hw:0,0"
    });

    speaker.on('error', function (err) {
        console.error('Speaker error : %s', err);
    });

    fs.createReadStream(file).pipe(speaker);
}

module.exports = { play, recordFile }