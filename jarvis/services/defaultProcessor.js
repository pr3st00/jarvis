'use strict';

const request = require('request-promise');
const exceptions = require('./exceptions');
const cmd = require('node-cmd');

const Logger = require('../logger');
const logger = new Logger('DEF_PROCESSOR');

const ModuleFactory = require('../modules/moduleFactory');
const moduleFactory = new ModuleFactory();

/**
 * Default processor
 */
class DefaultProcessor {
    /**
     * Process a single action
     *
     * @param {*} singleAction
     * @return {*} action
     */
    process(singleAction) {
        switch (singleAction.action) {
            case 'EXECUTE':
                return this.executeScript(singleAction.parameters);

            case 'HTTPGET':
                return this.doGetUrl(singleAction.parameters).
                 then(function(response) {
                    return response;
                });

            case 'MODULE':
                return this.callModule(singleAction.parameters);

            case 'STOP':
                return;

            default:
               throw new exceptions.ActionServiceError(
                   'Action not recognized');
        }
    }

    /**
     * Execute a script
     *
     * @param {*} parameters
     * @return {*} promisse
     */
    executeScript(parameters) {
        logger.log('[SCRIPT_CALL] Executing script [' + parameters[0] + ']');

        return new Promise((resolve, reject) => {
            cmd.get(
                parameters.join(' '),
                (err, data, stderr) => {
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
     *
     * @param {*} parameters
     * @return {*} action
     */
    doGetUrl(parameters) {
        logger.log('[HTTP_GET_CALL] Calling url [' + parameters[0] + ']');

        let url = parameters[0];
        let response = {};

        response = request({
            'method': 'GET',
            'uri': url,
            'json': true,
        });

        return response;
    }

    /**
     * Calls a module
     *
     * @param {*} parameters
     * @return {*} action
     */
    callModule(parameters) {
        logger.log('[MODULE_CALL] Calling module [' + parameters[0] + ']');

        module = moduleFactory.getModule(parameters[0]);

        if (!module) {
            throw new
                exceptions.ActionServiceError(
                    'Module [' + parameters[0] + '] not found.');
        }

        return module.process(parameters);
    }
}

module.exports = DefaultProcessor;
