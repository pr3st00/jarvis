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

function process(file, callback, errorCallBack) {
    console.log("[SERVICE_CALL] Calling stt with parameters [" + file + "]");

    if (serviceConfig.use_websockets) {
        processWithSockets(file, callback, errorCallBack);
    }
    else {
        processWithRest(file, callback, errorCallBack);
    }

}

function processWithRest(file, callback, errorCallBack) {
    var params = {
        audio: fs.createReadStream(file),
        content_type: 'audio/wav',
        timestamps: false,
        model: serviceConfig.model
        //acoustic_customization_id: serviceConfig.acoustic_customization_id
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
function processWithSockets(file, callback, errorCallBack) {

    var params = {
        content_type: 'audio/wav',
        timestamps: false,
        model: serviceConfig.model
    };

    // Create the stream.
    var recognizeStream = speech_to_text.createRecognizeStream(params);

    // Pipe in the audio.
    fs.createReadStream(file).pipe(recognizeStream);

    // Pipe out the transcription to a file.
    //recognizeStream.pipe(fs.createWriteStream('transcription.txt'));

    // Get strings instead of buffers from 'data' events.
    recognizeStream.setEncoding('utf8');

    // Listen for events.
    recognizeStream.on('results', function (event) { onEvent('Results:', event); });
    recognizeStream.on('data', function (event) { onEvent('Data:', event); });
    recognizeStream.on('error', function (event) { onEvent('Error:', event); });
    recognizeStream.on('close', function (event) { onEvent('Close:', event); });
    recognizeStream.on('speaker_labels', function (event) { onEvent('Speaker_Labels:', event); });

    // Displays events on the console.
    function onEvent(name, event) {
        console.log(name, JSON.stringify(event, null, 2));
    };

}

module.exports = { process };