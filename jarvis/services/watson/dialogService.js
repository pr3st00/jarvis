'use strict'

var config = require('../config').getConfig();
var request = require('request');

var Logger = require('../../logger');
var logger = new Logger("DIALOG_SERVICE");

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
                callback(body);
            }
        });

}

module.exports = { process }