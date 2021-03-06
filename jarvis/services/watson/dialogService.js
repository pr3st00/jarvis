'use strict';

const config = require('../config').getConfig();
const request = require('request');

const Logger = require('../../logger');
const logger = new Logger('DIALOG_SERVICE');
const Cache = require('../cache');
const cache = new Cache('DIALOG');

const serviceConfig = config.jarvis.services.watson.dialog;
const language = config.jarvis.language;

/**
 * Calls waston assistant and receives an action back
 *
 * @param {*} text
 * @param {*} callback
 */
function process(text, callback) {
    logger.log('Calling dialog with text [' + text + ']');

    let ini = new Date().getTime();
    let fromCache;
    let cacheKey = language + '|' + text;

    if (serviceConfig.useCache) {
        fromCache = cache.getCacheValue(cacheKey);

        if (fromCache) {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');
            logger.log('Response: ' + fromCache);

            callback(JSON.parse(fromCache));
            return;
        }
    }

    request.post({
        url: serviceConfig.url + '?lang=' + language,
        json: {
            'parameter': text,
        },
    },
        function(err, httpResponse, body) {
            logger.log('Response: ' + body);
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            if (err) {
                callback(err);
            } else {
                if (serviceConfig.useCache) {
                    if (!containsNonCacheableCode(body)) {
                        cache.putStringCacheValue(cacheKey,
                            JSON.stringify(body));
                    }
                }

                callback(body);
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
    if (!body || !body.actions) {
        return false;
    }

    for (let action of body.actions) {
        if (serviceConfig.do_not_cache_action_codes.includes(action.code)) {
            return true;
        }
    }

    return false;
}

module.exports = {process};
