'use strict'

var fs = require('fs');
var config = require('../config').getConfig();
const record = require('node-record-lpcm16');

var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

function process(file, callback, errorCallBack) {
    console.log("Calling stt with parameters [" + file + "]");

    var serviceConfig = config.jarvis.services.speech_to_text;

    var speech_to_text = new SpeechToTextV1({
        username: serviceConfig.username,
        password: serviceConfig.password
    });

    var params = {
        audio: fs.createReadStream(file),
        content_type: 'audio/wav',
        timestamps: false,
        model: "pt-BR_BroadbandModel"
    };

    speech_to_text.recognize(params, function (error, transcript) {
        if (error)
            errorCallBack(error);
        else {
            //No answer found   = {"results":[],"result_index":0}
            //Sucessfully found = {"results":[{"alternatives":[{"confidence":0.191,"transcript":"fã "}],"final":true}],"result_index":0}
            //console.log(JSON.stringify(transcript));
            if (transcript.results[0] &&
                transcript.results[0].alternatives[0]) {
                callback(transcript.results[0].alternatives[0].transcript);
            }
            else {
                errorCallBack("No answer found.");
            }
        }

    });
}

module.exports = { process };