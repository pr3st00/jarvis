'use strict'

var config = require('../config').getConfig();
var fs = require('fs');
var player = require('../player');

var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const AUDIO_FILE = '/tmp/out.wav';

function process(parameters, jarvis) {
    console.log("[SERVICE_CALL] Caling tts with text [" + parameters[0] + "]");

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

    jarvis.emit("speaking", { status: "SPEAKING", text: params.text});

    textToSpeech.synthesize(params)
        .pipe(fs.createWriteStream(AUDIO_FILE))
        .on('close', function () {
            player.play(AUDIO_FILE);
        });

}

module.exports = { process };
