'use strict';

const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const EventEmitter = require('events');

var processor = require('./services/actionsProcessor');
var config = require('./services/config').getConfig();

var emitter = new EventEmitter();
var jarvis = {};

jarvis.init = function() {
    this.busy = false;
    emitter = new EventEmitter();
}

jarvis.listen = function() {
    console.log("Listening");
}

jarvis.start = function () {
    this.init();
    waitForCommand();
    emitter.emit('running');
}

jarvis.on = function(event, callback) {
    emitter.on(event, callback);
}

jarvis.isBusy = function () {
    return this.busy;
}

jarvis.speak = function (text) {

    if (this.isBusy()) {
        console.error("Busy");
        return;
    }

    emitter.emit('speaking', text);

    this.busy = true;
    processor.process(processor.buildPlayAction(text), onError);
    this.busy = false;
}

function onError() {
    console.error(config.jarvis.dialogs.not_recognized);
    emitter.emit('error');
    this.busy = false;
}

function waitForCommand() {

    const models = new Models();

    models.add({
        file: 'jarvis/resources/jarvis-ptbr.pmdl',
        sensitivity: '0.40',
        hotwords: 'jarvis'
    });

    const detector = new Detector({
        resource: "jarvis/resources/common.res",
        models: models,
        audioGain: 2.0
    });

    detector.on('silence', function () {
        if (new Date().getSeconds() == 0) {
            console.log('..silence..');
        }
    });

    detector.on('sound', function (buffer) {
        console.log('Sound detected.');
    });

    detector.on('error', function () {
        console.log('error');
    });

    detector.on('hotword', function (index, hotword, buffer) {
        console.log('Hotword [' + hotword + "] received at index [" + index + "]");
        emitter.emit('hotword');
        jarvis.speak(config.jarvis.dialogs.greeting);
        jarvis.listen();
    });

    const mic = record.start({
        threshold: 0,
        device: "hw:1,0",
        verbose: false
    });

    mic.pipe(detector);
}

exports = module.exports = jarvis;
