'use strict'

var config = require('../config').getConfig();
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var streamify = require('stream-converter');

var serviceConfig = config.jarvis.services.speech_to_text;

var Logger = require('../../logger');
var logger = new Logger("SPEECH_TO_TEXT");

var NO_ANSWER_FOUND = "NO_ANSWER_FOUND";

var speech_to_text = new SpeechToTextV1({
    username: serviceConfig.username,
    password: serviceConfig.password
});

var webSocketparams = {
    content_type: 'audio/wav',
    timestamps: false,
    model: serviceConfig.model,
    acoustic_customization_id: serviceConfig.acoustic_customization_id
};

var recognizeStream = speech_to_text.createRecognizeStream(webSocketparams);
recognizeStream.setEncoding('utf8');

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

    var ini = new Date().getTime();

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
                errorCallBack(NO_ANSWER_FOUND);
            }
        }
    });
}

function processWithSockets(buffer, callback, errorCallBack) {

    var wav = require('wav');
    var writer = new wav.Writer();
    var hasResult = false;

    //streamify(buffer).pipe(recognizeStream);
    var ini = new Date().getTime();

    writer.pipe(recognizeStream);

    recognizeStream.on('data', function (text) {
        hasResult = true;

        var timeTaken = new Date().getTime() - ini;
        logger.log("Took: (" + timeTaken + ") ms.")

        logger.log("Response = [" + text + "]");
        callback(text);

    });

    recognizeStream.on('error', function (event) {
        errorCallBack(NO_ANSWER_FOUND);
    });

    recognizeStream.on('end', function () {
        if (!hasResult) {
            errorCallBack(NO_ANSWER_FOUND);
        }
    });

    writer.write(buffer);
    writer.end();

}

module.exports = { process };