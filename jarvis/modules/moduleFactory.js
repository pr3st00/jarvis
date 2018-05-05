'use strict';

const config = require('../config/jarvis.json');

const Logger = require('../logger');
const logger = new Logger('MODULE_FACTORY');

const MODULE_PATH = '../modules';

/**
 * Factory for loading modules
 */
class ModuleFactory {
    /**
     * Constructor
     */
    constructor() {
        this.config = config.jarvis.modules;
        this.modules = this.loadAllModules();
    }

    /**
     * Returns the module
     *
     * @param {x} moduleName
     * @return {*} module
     */
    getModule(moduleName) {
        if (this.modules) {
            for (const thisModule of this.modules) {
                if (thisModule.name == moduleName) {
                    let module = require(thisModule.module);
                    return module.getInstance(thisModule.name);
                }
            }
        }
    }

    /**
     * Loads all modules
     *
     * @return {*} array
     */
    loadAllModules() {
        let allModules = [];
        for (const module of this.config) {
            allModules.push(this.loadModule(module));
        }

        return allModules;
    }

    /**
     * Loads this particular module
     *
     * @param {*} moduleConfig
     * @return {*} module
     */
    loadModule(moduleConfig) {
        logger.log('Trying to load module: [' + moduleConfig.resource + ']');

        try {
            let modulePath = MODULE_PATH + '/' + moduleConfig.resource;
            return {name: moduleConfig.name, module: modulePath};
        } catch (err) {
            logger.logError('Error loading module: [' + err + ']');
        }
    }
};

exports = module.exports = ModuleFactory;
