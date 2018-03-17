'use strict'

const SERVICES_CONFIG_FILE = "../config/services.json";

function getProcessorImplementation() {

    var serviceConfig = JSON.parse(SERVICES_CONFIG_FILE);

    return jarvis.processor ? jarvis.processor : undefined;
}