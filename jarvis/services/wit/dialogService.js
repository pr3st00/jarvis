'use strict';

const config = require('../config').getConfig();
const request = require('request');

const Logger = require('../../logger');
const logger = new Logger('DIALOG_SERVICE');
const Cache = require('../cache');
const cache = new Cache('WIT_DIALOG');

const Actions = require('../actions');
const actions = new Actions();

const ActionMapper = require('../actionMapper');

const serviceConfig = config.jarvis.services.wit;

let ini;

let requestOptions = {
    url: serviceConfig.dialog.url,
    method: 'POST',
    json: true,
    headers: {
        'Authorization': 'Bearer ' + serviceConfig.token,
        'Accept': 'application/vnd.wit.' + serviceConfig.dialog.version,
    },
};

/**
 * Process a wit response into actions
 *
 * @param {*} body
 * @param {*} callback
 */
function processWitResponse(body, callback) {
    if (!body || body.error) {
        if (config.jarvis.dialogs.speak_when_not_recognized) {
            callback(
                actions.buildPlayAction(
                    config.jarvis.dialogs.not_recognized_message));
        }
    } else {
        let actionsList = retrieveActionsFromResponse(body);
        logger.log('Response: ' + JSON.stringify(actionsList));
        let timeTaken = new Date().getTime() - ini;
        logger.log('Took: (' + timeTaken + ') ms.');

        callback(actionsList);
    }
}

/**
 * Transforms a wit response into actions.
 *
 * @param {*} body
 * @return {*} actions
 */
function retrieveActionsFromResponse(body) {
    let intents = [];
    let entities = [];

    if (body.entities.intent) {
        for (let intent of body.entities.intent) {
            intents.push(intent.value);
        }
    }

    let actionsMapper = new ActionMapper(body._text, intents, entities);

    return actionsMapper.buildActions();
}

/**
 * Calls wit and returns actions
 *
 * @param {*} text
 * @param {*} callback
 */
function process(text, callback) {
    logger.log('Calling dialog with text [' + text + ']');

    ini = new Date().getTime();
    let fromCache;

    if (serviceConfig.useCache) {
        fromCache = cache.getCacheValue(text);

        if (fromCache) {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');
            logger.log('Response: ' + fromCache);

            callback(JSON.parse(fromCache));
            return;
        }
    }

    requestOptions['qs'] = {q: text};

    request.get(requestOptions,
        function(err, httpResponse, body) {
            if (err) {
                callback(err);
            } else {
                if (serviceConfig.useCache) {
                    if (!containsNonCacheableCode(body)) {
                        cache.putCacheValue(text, JSON.stringify(body));
                    }
                }

                processWitResponse(body, callback);
            }
        });
}

/**
 * Returns true if any action code is not cacheable
 *
 * @param {*} body
 * @return {*} boolean
 */
function containsNonCacheableCode(body) {
    if (!body) {
        return false;
    }

    for (let action of body.actions) {
        if (serviceConfig.do_not_cache_action_codes.includes(action.code)) {
            return true;
        }
    }

    return false;
}

module.exports = {process, processWitResponse};
