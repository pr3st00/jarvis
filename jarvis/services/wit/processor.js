'use strict';

const DefaultProcessor = require('../defaultProcessor');
const defaultProcessor = new DefaultProcessor();

// services
const witService = require('./witService');
const ttsService = require('./textToSpeechService');

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

/**
 * Process a command buffer.
 *
 * @param {*} buffer
 * @param {*} callback
 * @param {*} errorCallBack
 */
function processCommandBuffer(buffer, callback, errorCallBack) {
    witService.speech(buffer, callback, errorCallBack);
}

/**
 * Process a text command
 *
 * @param {*} text
 * @param {*} callback
 * @param {*} errorCallBack
 */
function processCommandText(text, callback, errorCallBack) {
    witService.text(text, callback, errorCallBack);
}

module.exports = {process, setJarvis, processCommandBuffer, processCommandText};
