'use strict'

var fs = require('fs');

const SERVICES_CONFIG_FILE = "config/services.json";

function getProcessorImplementation() {

    var serviceConfig = JSON.parse(fs.readFileSync(SERVICES_CONFIG_FILE, 'utf8'));
    
    return serviceConfig.jarvis.processor ? 
       serviceConfig.jarvis.processor : undefined;
}

module.exports = { getProcessorImplementation }