'use strict'

var fs = require('fs');
var Speaker = require('speaker');
var config = require('../config').getConfig();

var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

function process(parameters) {
    console.log("Invoking tts with text [" + parameters[0] + "]");

    var serviceConfig = config.jarvis.services.text_to_speech;

    var textToSpeech = new TextToSpeechV1({
        username: serviceConfig.username,
        password: serviceConfig.password
    });

    var params = {
        text: parameters[0],
        voice: serviceConfig.voice,
        accept: 'audio/wav'
    };

    textToSpeech.synthesize(params)
        .pipe(fs.createWriteStream('/tmp/out.wav'))
        .on('close', function () {
            var speaker = new Speaker({
                channels: 1,
                bitDepth: 16,
                sampleRate: 22050,
                device: "hw:0,0"
            });

            speaker.on('error', function (err) {
                console.error('Speaker error : %s', err);
            });

            fs.createReadStream('/tmp/out.wav').pipe(speaker);
        });

}

module.exports = { process };
