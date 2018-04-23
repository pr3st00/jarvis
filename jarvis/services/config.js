'use strict'

var fs = require('fs');

const SERVICES_CONFIG_FILE = "config/services.json";

function getProcessorImplementation() {

    var serviceConfig = getConfig();
    
    return serviceConfig.jarvis.processor ? 
       serviceConfig.jarvis.processor : undefined;
    
}

function getConfig() {
    return JSON.parse(fs.readFileSync(SERVICES_CONFIG_FILE, 'utf8'));
}

module.exports = { getProcessorImplementation, getConfig }