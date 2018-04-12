'use strict';

const EventEmitter = require('events');
const fs = require('fs');

var processor = require('./services/actionsProcessor');
var config = require('./services/config').getConfig();
var player = require('./services/player');

// TODO: Make platform agnostic
var sttService = require('./services/watson/speechToTextService');
var dialogService = require('./services/watson/dialogService');

var emitter = new EventEmitter();
var jarvis = {};

jarvis.init = function () {
    this.busy = false;
    emitter = new EventEmitter();
}

jarvis.process = function (fileName, callback) {

    var sucessCallback = function (text) {
        dialogService.process(text,
            function (actions) {
                processor.process(actions, onError);
                callback();
            });
    };

    var errorCallback = function (message) { 
        callback(); onError(message); 
    };

    sttService.process(
        fileName,
        sucessCallback,
        errorCallback
    );
}

jarvis.start = function () {
    this.init();
    emitAndLog('running');
}

jarvis.on = function (event, callback) {
    emitter.on(event, callback);
}

jarvis.processCommand = function (fileName, callback) {
        emitAndLog('processing_command');
        jarvis.process(fileName, callback);
}

jarvis.speak = function (text) {
    emitter.emit('speaking', text);
    processor.process(processor.buildPlayAction(text), onError);
}

function onError(message) {
    console.error("[ERROR] " + message || config.jarvis.dialogs.not_recognized);
    //emitter.emit('error');
}

function emitAndLog(event) {
    console.log("[EVENT] " + event);
    emitter.emit(event);
}

exports = module.exports = jarvis;
