'use strict'

var fs = require('fs');
var config = require('../config').getConfig();
const record = require('node-record-lpcm16');
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

var serviceConfig = config.jarvis.services.speech_to_text;

var speech_to_text = new SpeechToTextV1({
    username: serviceConfig.username,
    password: serviceConfig.password
});

function process(data, callback, errorCallBack) {
    console.log("[SERVICE_CALL] Calling stt.");

    if (serviceConfig.use_websockets) {
        processWithSockets(data, callback, errorCallBack);
    }
    else {
        processWithRest(data, callback, errorCallBack);
    }

}

function processWithRest(file, callback, errorCallBack) {
    var params = {
        audio: fs.createReadStream(file),
        content_type: 'audio/wav',
        timestamps: false,
        model: serviceConfig.model,
        acoustic_customization_id: serviceConfig.acoustic_customization_id
    };

    speech_to_text.recognize(params, function (error, transcript) {
        if (error)
            errorCallBack(error);
        else {
            //No answer found   = {"results":[],"result_index":0}
            //Sucessfully found = {"results":[{"alternatives":[{"confidence":0.191,"transcript":"fã "}],"final":true}],"result_index":0}
            console.log(JSON.stringify(transcript));
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
function processWithSockets(buffer, callback, errorCallBack) {

    var streamify = require('stream-converter');

    var params = {
        content_type: 'audio/wav',
        timestamps: false,
        model: serviceConfig.model,
        acoustic_customization_id: serviceConfig.acoustic_customization_id
    };

    var recognizeStream = speech_to_text.createRecognizeStream(params);

    streamify(buffer).pipe(recognizeStream);

    recognizeStream.setEncoding('utf8');

    recognizeStream.on('results', function (event) {
        //No answer found   = {"results":[],"result_index":0}
        //Sucessfully found = {"results":[{"alternatives":[{"confidence":0.191,"transcript":"fã "}],"final":true}],"result_index":0}
        console.log(JSON.stringify(event));
        if (transcript.results[0] &&
            transcript.results[0].alternatives[0]) {
            callback(transcript.results[0].alternatives[0].transcript);
        }
        else {
            errorCallBack("No answer found.");
        }

    });

    recognizeStream.on('error', function (event) {
        errorCallBack("No answer found.");
    });

}

module.exports = { process };