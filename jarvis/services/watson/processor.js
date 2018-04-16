'use strict'

var sttService = require('./speechToTextService');
var ttsService = require('./textToSpeechService');
var defaultProcessor = require('../defaultProcessor');

function process(singleAction) {

    switch (singleAction.action) {

        case "PLAY":
            ttsService.process(singleAction.parameters);
            break;

        case "EXECUTE":
            defaultProcessor.process(singleAction.parameters);
            break;

    }
}

module.exports = { process };