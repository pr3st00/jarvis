'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../jarvis/services/config').getConfig();
const buildPlayAction =
 require('../jarvis/services/actionsProcessor').buildPlayAction;

router.get('/', function(req, res, next) {
    let serviceConfig = config.jarvis.services.weather;

    let url = serviceConfig.url + serviceConfig.city
        + '/current?token=' + serviceConfig.token;

    request.get({
        url: url,
    },
        function(err, httpResponse, body) {
            if (err) {
                res.send(buildPlayAction(serviceConfig.error_message));
            } else {
                res.send(buildResponse(JSON.parse(body)));
            }
        });
});

/**
 * Builds the response json
 * @param {*} body
 * @return {*} json
 */
function buildResponse(body) {
    let text = 'Hoje em ' + body.name + ', temperatura de ' +
    body.data.temperature + ' graus e '
        + body.data.condition;

    return buildPlayAction(text);
}

module.exports = router;
