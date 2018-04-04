'use strict'

var fs = require('fs');
var config = require('../config').getConfig();
const record = require('node-record-lpcm16');

var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

function process(parameters) {
    console.log("Calling stt with parameters [" + parameters + "]");

    var serviceConfig = config.jarvis.services.speech_to_text;

    var speech_to_text = new SpeechToTextV1({
        username: serviceConfig.username,
        password: serviceConfig.password
    });

    var params = {
        audio: fs.createReadStream(parameters[0]),
        content_type: 'audio/wav',
        timestamps: true,
        word_alternatives_threshold: 0.9,
        keywords: ['colorado', 'tornado', 'tornadoes'],
        keywords_threshold: 0.5
    };

    speech_to_text.recognize(params, function (error, transcript) {
        if (error)
            console.error('Error:', error);
        else
            console.log(JSON.stringify(transcript, null, 2));
    });
}

module.exports = { process };