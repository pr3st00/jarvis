'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../jarvis/services/config').getConfig();
const buildPlayAction =
 require('../jarvis/services/actionsProcessor').buildPlayAction;

const commands = {
    'netflix': 'AAAAAgAAABoAAAB8Aw==',
    'turnoff': 'AAAAAQAAAAEAAAAvAw==',
};

const serviceConfig = config.jarvis.services.braviatv;

router.get('/', function(req, res, next) {
    let url = 'http://' + serviceConfig.ip + '/sony/IRCC';

    let command = req.query.command;

    if (!command) {
        res.send(buildPlayAction(serviceConfig.error_message));
        return;
    }

    let ircc = commands[command];

    if (!ircc) {
        res.send(buildPlayAction(serviceConfig.error_message));
        return;
    }

    request.post({
        url: url,
        body: buildRequest(ircc),
        headers: {
            'X-Auth-PSK': serviceConfig.key,
        },
    },
        function(err, httpResponse, body) {
            if (err) {
                res.send(buildPlayAction(serviceConfig.error_message));
            } else {
                res.send(buildPlayAction(serviceConfig.success_message));
            }
        });
});

/**
 * Builds a soap request for controlling the tv.
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

module.exports = router;
