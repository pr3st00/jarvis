'use strict'

var config = require('../config').getConfig();
var fs = require('fs');
var player = require('../player');

var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const AUDIO_FILE = '/tmp/out.wav';

var Logger = require('../../logger');
var logger = new Logger("TEXT_TO_SPEECH");

function process(singleAction, jarvis) {
    var parameters = singleAction.parameters;
    
    logger.log("[SERVICE_CALL] Caling tts with text [" + parameters[0] + "]");

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

    jarvis.emit("speaking", { status: "SPEAKING", text: params.text });

    var ini = new Date().getTime();

    textToSpeech.synthesize(params)
        .pipe(fs.createWriteStream(AUDIO_FILE))
        .on('close', function () {
            var timeTaken = new Date().getTime() - ini;
            logger.log("Took: (" + timeTaken + ") ms.")

            player.play(AUDIO_FILE);
        });

}

module.exports = { process };
