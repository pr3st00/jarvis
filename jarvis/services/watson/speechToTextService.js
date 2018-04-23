'use strict'

var fs = require('fs');
var config = require('../config').getConfig();
const record = require('node-record-lpcm16');
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

var serviceConfig = config.jarvis.services.speech_to_text;

var Logger = require('../../logger');
var logger = new Logger("SPEECH_TO_TEXT");

var speech_to_text = new SpeechToTextV1({
    username: serviceConfig.username,
    password: serviceConfig.password
});

function process(data, callback, errorCallBack) {
    logger.log("[SERVICE_CALL] Calling stt.");

    if (serviceConfig.use_websockets) {
        processWithSockets(data, callback, errorCallBack);
    }
    else {
        processWithRest(data, callback, errorCallBack);
    }

}

function processWithRest(buffer, callback, errorCallBack) {
    var wav = require('wav');
    var writer = new wav.Writer();

    var ini = new Date().getTime();

    writer.write(buffer);
    writer.end();

    var params = {
        audio: writer,
        content_type: 'audio/wav',
        timestamps: false,
        'interim_results': false,
        model: serviceConfig.model,
        acoustic_customization_id: serviceConfig.acoustic_customization_id
    };

    speech_to_text.recognize(params, function (error, transcript) {

        var timeTaken = new Date().getTime() - ini;
        logger.log("Took: (" + timeTaken + ") ms.")

        if (error)
            errorCallBack(error);
        else {
            //No answer found   = {"results":[],"result_index":0}
            //Sucessfully found = {"results":[{"alternatives":[{"confidence":0.191,"transcript":"fã "}],"final":true}],"result_index":0}
            logger.log(JSON.stringify(transcript));
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
    var wav = require('wav');
    var writer = new wav.Writer();

    var params = {
        content_type: 'audio/wav',
        timestamps: false,
        model: serviceConfig.model,
        acoustic_customization_id: serviceConfig.acoustic_customization_id
    };

    var recognizeStream = speech_to_text.createRecognizeStream(params);

    //streamify(buffer).pipe(recognizeStream);
    writer.pipe(recognizeStream);

    recognizeStream.setEncoding('utf8');

    recognizeStream.on('finish', function (event) {
        //No answer found   = {"results":[],"result_index":0}
        //Sucessfully found = {"results":[{"alternatives":[{"confidence":0.191,"transcript":"fã "}],"final":true}],"result_index":0}
        logger.log(JSON.stringify(event));

        //if (transcript.results[0] &&
        //    transcript.results[0].alternatives[0]) {
        //    callback(transcript.results[0].alternatives[0].transcript);
        //}
        //else {
        //    errorCallBack("No answer found.");
        //}
    });

    recognizeStream.on('error', function (event) {
        errorCallBack("No answer found.");
    });

    writer.write(buffer);
    writer.end();

}
module.exports = { process };