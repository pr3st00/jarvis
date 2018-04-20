'use strict'

var sttService = require('./speechToTextService');
var ttsService = require('./textToSpeechService');
var defaultProcessor = require('../defaultProcessor');
var _jarvis;

function setJarvis(jarvis) {
    _jarvis = jarvis;
}

/**
 * Executes a single action possibly returning new actions.
 * 
 * @param {*} singleAction 
 */
function process(singleAction) {

    switch (singleAction.action) {

        case "PLAY":
            return ttsService.process(singleAction, _jarvis);

        case "EXECUTE":
            return defaultProcessor.process(singleAction, _jarvis);

        case "HTTPGET":
            return defaultProcessor.process(singleAction, _jarvis);

    }
}

module.exports = { process, setJarvis };