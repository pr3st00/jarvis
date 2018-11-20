'use strict';

const DefaultProcessor = require('../defaultProcessor');
const defaultProcessor = new DefaultProcessor();

const ActionsProcessor = require('../actionsProcessor');
const actionsProcessor = new ActionsProcessor();

// services
const ttsService = require('./textToSpeechService');
const sttService = require('./speechToTextService');
const dialogService = require('./dialogService');

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
    sttService.process(
        buffer,
        (text) => {
            processCommandText(text, callback, errorCallBack);
        },
        errorCallBack
    );
}

/**
 * Process a text command
 *
 * @param {*} text
 * @param {*} callback
 * @param {*} errorCallBack
 */
function processCommandText(text, callback, errorCallBack) {
    _jarvis.emit('understood_command', {status: 'UNDERSTOOD', text: text});
    dialogService.process(text,
        (actions) => {
            actionsProcessor.setJarvis(_jarvis);
            actionsProcessor.process(actions, errorCallBack, callback);
        });
}

module.exports = {process, setJarvis, processCommandBuffer, processCommandText};
