'use strict';

const config = require('../config').getConfig();
const streamifier = require('streamifier');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const Lame = require('node-lame').Lame;

const serviceConfig = config.jarvis.services.watson.speech_to_text;

const Logger = require('../../logger');
const logger = new Logger('SPEECH_TO_TEXT');

const NO_ANSWER_FOUND = 'NO_ANSWER_FOUND';

const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({ apikey: serviceConfig.apiKey }),
    serviceUrl: serviceConfig.url
});

const webSocketparams = {
    content_type: 'audio/wav',
    timestamps: false,
    model: serviceConfig.model,
    acoustic_customization_id: serviceConfig.acoustic_customization_id,
};

let recognizeStream = speechToText.recognizeUsingWebSocket(webSocketparams);
recognizeStream.setEncoding('utf8');

/**
 * Process the request on data
 *
 * @param {*} data
 * @param {*} callback
 * @param {*} errorCallBack
 */
function process(data, callback, errorCallBack) {
    logger.log('Calling stt.');

    if (serviceConfig.use_websockets) {
        processWithSockets(data, callback, errorCallBack);
    } else {
        processWithRest(data, callback, errorCallBack);
    }
}

/**
 * Process request using REST service
 *
 * @param {*} buffer
 * @param {*} callback
 * @param {*} errorCallBack
 */
function processWithRest(buffer, callback, errorCallBack) {
    switch (serviceConfig.audio_format) {
        case 'mp3':
            const decoder = new Lame({
                'output': 'buffer',
            }).setBuffer(buffer);

            decoder.decode()
                .then(() => {
                    doTranslation(decoder.getBuffer(), 'audio/mp3',
                        callback, errorCallBack);
                })
                .catch((error) => {
                    logger.logError(error);
                });

            break;

        default:
            doTranslation(buffer, 'audio/wav', callback, errorCallBack);
            break;
    }
}

/**
 * Calls the STT service
 *
 * @param {*} audioBuffer
 * @param {*} contentType
 * @param {*} callback
 * @param {*} errorCallBack
 */
function doTranslation(audioBuffer, contentType, callback, errorCallBack) {
    let params = {
        'audio': streamifier.createReadStream(audioBuffer),
        'contentType': contentType,
        'timestamps': false,
        'interim_results': false,
        'model': serviceConfig.model,
    };

    if (serviceConfig.acoustic_customization_id) {
        params['acoustic_customization_id'] =
            serviceConfig.acoustic_customization_id;
    }

    let ini = new Date().getTime();

    speechToText.recognize(params)
    .then(transcript => {
        let timeTaken = new Date().getTime() - ini;
        logger.log('Took: (' + timeTaken + ') ms.');

        let response = transcript.result;

        logger.log(JSON.stringify(response));

        if (response.results[0] &&
            response.results[0].alternatives[0]) {
            callback(response.results[0].alternatives[0].transcript);
        } else {
            errorCallBack(NO_ANSWER_FOUND);
        }
    })
    .catch(error => {
        errorCallBack(error);
    });
}

/**
 * Process the request using websockets
 *
 * @param {*} buffer
 * @param {*} callback
 * @param {*} errorCallBack
 */
function processWithSockets(buffer, callback, errorCallBack) {
    let wav = require('wav');
    let writer = new wav.Writer();
    let hasResult = false;

    // streamify(buffer).pipe(recognizeStream);
    let ini = new Date().getTime();

    writer.pipe(recognizeStream);

    recognizeStream.on('data', function(text) {
        hasResult = true;

        let timeTaken = new Date().getTime() - ini;
        logger.log('Took: (' + timeTaken + ') ms.');

        logger.log('Response = [' + text + ']');
        callback(text);
    });

    recognizeStream.on('error', function(event) {
        errorCallBack(NO_ANSWER_FOUND);
    });

    recognizeStream.on('end', function() {
        if (!hasResult) {
            errorCallBack(NO_ANSWER_FOUND);
        }
    });

    writer.write(buffer);
    writer.end();
}

module.exports = {process};
