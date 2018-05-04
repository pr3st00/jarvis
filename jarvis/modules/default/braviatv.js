'use strict';

const request = require('request');
const buildPlayAction =
    require('../services/actionsProcessor').buildPlayAction;

const config = require('../../services/config').getConfig();

const commands = {
    'netflix': 'AAAAAgAAABoAAAB8Aw==',
    'turnoff': 'AAAAAQAAAAEAAAAvAw==',
};

const serviceConfig = config.jarvis.services.braviatv;

/**
 *
 * @param {*} parameters
 * @return {*} promise
 */
function process(parameters) {
    let url = 'http://' + serviceConfig.ip + '/sony/IRCC';

    let command = parameters[1];

    if (!command) {
        return buildPlayAction(serviceConfig.error_message);
    }

    let ircc = commands[command];

    if (!ircc) {
        return buildPlayAction(serviceConfig.error_message);
    }

    return new Promise((resolve, reject) => {
        request.post({
            url: url,
            body: buildRequest(ircc),
            headers: {
                'X-Auth-PSK': serviceConfig.key,
            },
        },
            function(err, httpResponse, body) {
                if (err) {
                    resolve(buildPlayAction(serviceConfig.error_message));
                } else {
                    resolve(buildPlayAction(serviceConfig.success_message));
                }
            });
    });
};

/**
 * Builds a soap request for controlling the tv
 *
 * @param {*} ircc
 * @return {*} string
 */
function buildRequest(ircc) {
    let string = '<?xml version="1.0" encoding="utf-8"?>' +
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
        '   <s:Body> ' +
        '       <u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">' +
        ' <IRCCCode>' + ircc + '</IRCCCode>' +
        '</u:X_SendIRCC>' +
        '</s:Body>' +
        '</s:Envelope> ';

    return string;
}

module.exports = {process};
