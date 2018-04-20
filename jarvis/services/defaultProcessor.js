'use strict'

var request = require('request-promise');
var Logger = require('../logger');
var logger = new Logger("DEFAULT_PROCESSOR");

/**
 * 
 * @param {*} singleAction 
 */
function process(singleAction) {

    switch (singleAction.action) {

        case "EXECUTE":
            return executeScript(singleAction.parameters);

        case "HTTPGET":
            return doGetUrl(singleAction.parameters).then(function(response) {
                return response;
            });

    }
}

function executeScript(parameters) {
    logger.log("[SCRIPT_CALL] Executing script [" + parameters[0] + "]");

    cmd.get(
        parameters[0],
        function (err, data, stderr) {
            logger.log(err, data, stderr);
            callback(data);
        }
    );

}

async function doGetUrl(parameters) {
    logger.log("[HTTP_GET_CALL] Calling url [" + parameters[0] + "]");

    var url = parameters[0];
    var response = {};

    response = await request({
        "method": "GET",
        "uri": url,
        "json": true
    });

    return response;

}

module.exports = { process };