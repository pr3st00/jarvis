'use strict';

const ttsService = require('./textToSpeechService');
const defaultProcessor = require('../defaultProcessor');
let _jarvis;

/**
 * Sets jarvis
 *
 * @param {*} jarvis
 */
function setJarvis(jarvis) {
    _jarvis = jarvis;
}

/**
 * Executes a single action possibly returning new actions
 *
 * @param {*} singleAction
 * @return {*} processor
 */
function process(singleAction) {
    switch (singleAction.action) {
        case 'PLAY':
            return ttsService.process(singleAction, _jarvis);

        default:
            return defaultProcessor.process(singleAction, _jarvis);
    }
}

module.exports = {process, setJarvis};
