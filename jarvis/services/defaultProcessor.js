'use strict';

const request = require('request-promise');
const exceptions = require('./exceptions');
const cmd = require('node-cmd');

const Logger = require('../logger');
const logger = new Logger("DEF_PROCESSOR");

const ModuleFactory = require('../modules/moduleFactory');
const moduleFactory = new ModuleFactory();

/**
 * Process a single action
 * 
 * @param {*} singleAction 
 */
function process(singleAction) {

    switch (singleAction.action) {

        case "EXECUTE":
            return executeScript(singleAction.parameters);

        case "HTTPGET":
            return doGetUrl(singleAction.parameters).then(function (response) {
                return response;
            });

        case "MODULE":
            return callModule(singleAction.parameters);
    }
}

/**
 * Execute a script
 * 
 * @param {*} parameters 
 */
function executeScript(parameters) {
    logger.log("[SCRIPT_CALL] Executing script [" + parameters[0] + "]");

    return new Promise((resolve, reject) => {
        cmd.get(
            parameters[0],
            function (err, data, stderr) {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(data));
                }
            }
        );
    });
}

/**
 * Executes a HTTPGET call
 * @param {*} parameters 
 */
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

/**
 * Calls a module
 *
 * @param {*} parameters 
 */
function callModule(parameters) {
    logger.log('[MODULE_CALL] Calling module [' + parameters[0] + ']');

    module = moduleFactory.getModule(parameters[0]);

    if (!module) {
        throw new exceptions.ActionServiceError('Module [' + parameters[0] + '] not found.');
    }

    return module.process(parameters);
}

module.exports = { process };