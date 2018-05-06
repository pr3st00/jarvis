'use strict';

const config = require('../services/config').getConfig();
const buildPlayAction =
    require('../services/actionsProcessor').buildPlayAction;
const buildStopAction =
    require('../services/actionsProcessor').buildStopAction;
const Logger = require('../logger');

/**
 * Jarvis module base class
 */
class JarvisModule {
    /**
     * Constructor
     *
     *  @param {*} moduleName
     */
    constructor(moduleName) {
        this.name = moduleName;
        this.config = findConfig(moduleName);
        this.logger = new Logger(moduleName);
    }

    /**
     * Builds a play action
     *
     * @param {*} message
     * @return {*} json
     */
    buildPlayAction(message) {
        return buildPlayAction(message);
    }

    /**
     * Builds an stop action
     *
     * @param {*} message
     * @return {*} json
     */
    buildStopAction(message) {
        return buildStopAction();
    }
}

/**
 * Finds the config related to this particular module
 *
 * @param {*} moduleName
 * @return {*} moduleConfig
 */
function findConfig(moduleName) {
    for (let moduleConfig of config.jarvis.modules) {
        if (moduleName == moduleConfig.name) {
            return moduleConfig;
        }
    }
}

exports = module.exports = JarvisModule;
