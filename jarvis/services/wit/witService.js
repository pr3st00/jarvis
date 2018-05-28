'use strict';

const request = require('request');
const config = require('../config').getConfig();

const Logger = require('../../logger');
const logger = new Logger('WIT_SERVICE');

const dialogService = require('./dialogService');
const ActionsProcessor = require('../actionsProcessor');
const actionsProcessor = new ActionsProcessor();

const serviceConfig = config.jarvis.services.wit;

let _jarvis;

const requestOptions = {
    url: serviceConfig.speech.url,
    method: 'POST',
    json: true,
    headers: {
        'Authorization': 'Bearer ' + serviceConfig.token,
        'Content-Type': 'audio/wav',
        'Accept': 'application/vnd.wit.' + serviceConfig.speech.version,
    },
};

/**
 *
 * @param {*} buffer
 * @param {*} callback
 * @param {*} errorCallBack
 */
function speech(buffer, callback, errorCallBack) {
    let wav = require('wav');
    let writer = new wav.Writer();

    writer.write(buffer);
    writer.end();

    let sucessCallback = (error, response, body) => {
        logger.log('Wit response is: ' + JSON.stringify(body));

        dialogService.processWitResponse(body,
            (actions) => {
                actionsProcessor.setJarvis(_jarvis);
                actionsProcessor.process(actions, errorCallBack, callback);
            }
        );

        if (error) {
            errorCallBack(error);
        }
    };

    writer.pipe(request(requestOptions, sucessCallback));
}

/**
 *
 * @param {*} text
 * @param {*} callback
 * @param {*} errorCallBack
 */
function text(text, callback, errorCallBack) {
    dialogService.process(text,
        (actions) => {
            actionsProcessor.process(actions, errorCallBack, callback);
        });
}

module.exports = {speech, text};
