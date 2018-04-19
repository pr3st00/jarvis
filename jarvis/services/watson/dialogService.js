'use strict'

var config = require('../config').getConfig();
var request = require('request');

/**
 * Calls waston assistant and receives an action back
 * 
 * @param {*} text 
 * @param {*} jarvis 
 * @param {*} callback 
 */
function process(text, jarvis, callback) {
    console.log("[SERVICE_CALL] Calling dialog with text [" + text + "]");

    var serviceConfig = config.jarvis.services.dialog;

    request.post({
        url: serviceConfig.url,
        json: {
            "parameter": text
        }
    },
        function (err, httpResponse, body) {
            console.log(body);

            if (err) {
                callback(err);
            }
            else {
                callback(body);
            }
        });

}

module.exports = { process }