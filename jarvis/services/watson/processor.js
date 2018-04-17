'use strict'

var sttService = require('./speechToTextService');
var ttsService = require('./textToSpeechService');
var defaultProcessor = require('../defaultProcessor');
var _jarvis;

function setJarvis(jarvis) {
    _jarvis = jarvis;
}

function process(singleAction) {

    switch (singleAction.action) {

        case "PLAY":
            ttsService.process(singleAction.parameters, _jarvis);
            break;

        case "EXECUTE":
            defaultProcessor.process(singleAction.parameters, _jarvis);
            break;

    }
}

module.exports = { process, setJarvis };