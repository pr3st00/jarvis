'use strict';

const request = require('request');

const URL = 'https://us-central1-kivson.cloudfunctions.net/charada-aleatoria';
const ERROR_MESSAGE = 'Nao consegui achar uma boa.';

const buildPlayAction =
 require('../../services/actionsProcessor').buildPlayAction;


/**
 * Process and returns a joke
 *
 * @param {*} parameters
 * @return {*} promise
 */
function process(parameters) {
    return new Promise((resolve, reject) => {
        request.get({
            url: URL,
            json: true,
        },
            function(err, httpResponse, body) {
                if (err) {
                    return resolve(buildPlayAction(ERROR_MESSAGE));
                } else {
                    return resolve(buildPlayAction(buildResponse(body)));
                }
            });
    });
}

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

    return text;
}

module.exports = {process};
