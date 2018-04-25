'use strict'

var fs = require('fs');
var config = require('../config').getConfig();
var request = require('request');

var Logger = require('../../logger');
var logger = new Logger("DIALOG_SERVICE");
var Cache = require('../cache');
var cache = new Cache("DIALOG");


/**
 * Calls waston assistant and receives an action back
 * 
 * @param {*} text 
 * @param {*} jarvis 
 * @param {*} callback 
 */
function process(text, jarvis, callback) {
    logger.log("Calling dialog with text [" + text + "]");

    var serviceConfig = config.jarvis.services.dialog;

    var ini = new Date().getTime();
    var fromCache;

    if (serviceConfig.useCache) {
        fromCache = cache.getCacheValue(text);

        if (fromCache) {
            var timeTaken = new Date().getTime() - ini;
            logger.log("Took: (" + timeTaken + ") ms.");
            logger.log("Response: " + fromCache);

            callback(JSON.parse(fromCache));
            return;
        }
    }

    request.post({
        url: serviceConfig.url,
        json: {
            "parameter": text
        }
    },
        function (err, httpResponse, body) {

            logger.log("Response: " + body);
            var timeTaken = new Date().getTime() - ini;
            logger.log("Took: (" + timeTaken + ") ms.")

            if (err) {
                callback(err);
            }
            else {
                if (serviceConfig.useCache) {
                    cache.putCacheValue(text, JSON.stringify(body));
                }

                callback(body);
            }
        });

}

module.exports = { process }