'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');
const buildPlayAction =
 require('../jarvis/services/actionsProcessor').buildPlayAction;

const URL = 'https://us-central1-kivson.cloudfunctions.net/charada-aleatoria';
const ERROR_MESSAGE = 'Nao consegui achar uma boa.';

router.get('/', function(req, res, next) {
    request.get({
        url: URL,
        json: true,
    },
        function(err, httpResponse, body) {
            if (err) {
                res.send(buildPlayAction(ERROR_MESSAGE));
            } else {
                res.send(buildResponse(body));
            }
        });
});

/**
 * Builds the response
 *
 * @param {*} body
 * @return {*} string
 */
function buildResponse(body) {
    let text = ERROR_MESSAGE;

    if (body && body.pergunta && body.resposta) {
         text = body.pergunta.replace(/[\?]/g, '.') + ' ' + body.resposta;
    }

    return buildPlayAction(text);
}

module.exports = router;
