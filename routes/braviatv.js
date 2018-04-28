'use strict'

var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../jarvis/services/config').getConfig();
var buildPlayAction = require('../jarvis/services/actionsProcessor').buildPlayAction;

const commands = { "netflix": "AAAAAgAAABoAAAB8Aw==" }

router.get('/', function (req, res, next) {

    var serviceConfig = config.jarvis.services.braviatv;
    var url = "http://" + serviceConfig.ip + "/sony/IRCC";

    var command = req.query.command;

    if (!command) {
        res.send(buildPlayAction(serviceConfig.error_message));
        return;
    }

    var ircc = commands[command];

    if (!ircc) {
        res.send(buildPlayAction(serviceConfig.error_message));
        return;
    }

    request.post({
        url: url,
        body: buildRequest(ircc),
        headers: {
            'X-Auth-PSK': serviceConfig.key
        }
    },
        function (err, httpResponse, body) {
            if (err) {
                res.send(buildPlayAction(serviceConfig.error_message));
            }
            else {
                res.send(buildPlayAction(serviceConfig.success_message));
            }
        });

});

/**
 * Builds a soap request for controlling the tv.
 */
function buildRequest(ircc) {

    var string = '<?xml version="1.0" encoding="utf-8"?>' +
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
        '   <s:Body> ' +
        '       <u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">' +
        '	<IRCCCode>' + ircc + '</IRCCCode>' +
        '</u:X_SendIRCC>' +
        '</s:Body>' +
        '</s:Envelope> ';

    return string;

}

module.exports = router;
