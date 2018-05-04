'use strict';

const request = require('request');
const config = require('../../services/config').getConfig();
const buildPlayAction =
    require('../../services/actionsProcessor').buildPlayAction;
const serviceConfig = config.jarvis.services.weather;

/**
 *
 * @param {*} parameters
 * @return {*} promise
 */
function process(parameters) {
    let url = serviceConfig.url + serviceConfig.city
        + '/current?token=' + serviceConfig.token;

    return new Promise((resolve, reject) => {

        request.get({
            url: url,
        },
            function(err, httpResponse, body) {
                if (err) {
                    resolve(buildPlayAction(serviceConfig.error_message));
                } else {
                    resolve(buildResponse(JSON.parse(body)));
                }
            });
    });
};

/**
 * Builds the response json
 *
 * @param {*} body
 * @return {*} json
 */
function buildResponse(body) {
    let text = 'Hoje em ' + body.name + ', temperatura de ' +
        body.data.temperature + ' graus e '
        + body.data.condition;

    return buildPlayAction(text);
}

module.exports = { process };
