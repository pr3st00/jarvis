'use strict'

var sttService = require('./speechToTextService');
var ttsService = require('./textToSpeechService');

function process(singleAction) {

    switch (singleAction.action) {

        case "PLAY":
            ttsService.process(singleAction.parameters);
            break;

    }
}

module.exports = { process };