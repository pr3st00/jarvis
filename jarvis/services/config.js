'use strict';

const fs = require('fs');

const SERVICES_CONFIG_FILE = 'jarvis/config/services.json';

/**
 * Gets the processor implementation to be used
 *
 * @return {*} processor
 */
function getProcessorImplementation() {
    let serviceConfig = getConfig();

    return serviceConfig.jarvis.processor ?
       serviceConfig.jarvis.processor : undefined;
}

/**
 * Retrieves the configuration for the services
 *
 * @return {*} json
 */
function getConfig() {
    return JSON.parse(fs.readFileSync(SERVICES_CONFIG_FILE, 'utf8'));
}

module.exports = {getProcessorImplementation, getConfig};
