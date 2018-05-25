'use strict';

const request = require('request');
const config = require('../config').getConfig();

const Logger = require('../../logger');
const logger = new Logger('WIT_SERVICE');

const serviceConfig = config.jarvis.services.wit;

const VERSION = '20170307';

const requestOptions = {
    url: serviceConfig.speech.url,
    method: 'POST',
    json: true,
    headers: {
        'Authorization': 'Bearer ' + serviceConfig.token,
        'Content-Type': 'audio/wav',
        'Accept': 'application/vnd.wit.' + VERSION,
    },
};


/**
*
*{
*  "_text" : "hoje em Campinas temperatura de 16 graus e alguma nebulosidade",
*  "entities" : {
*    "intent" : [ {
*
*       "confidence" : 0.80811285073324,
*      "value" : "horas"
*    } ]
*  },
*  "msg_id" : "0xk2I0dNbz5zKvcwp"
*}
**/

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
        callback();
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
            actionsProcessor.setJarvis(_jarvis);
            actionsProcessor.process(actions, errorCallBack, callback);
        });


}

module.exports = { speech, text };
