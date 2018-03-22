'use strict';

var processor = require('./services/actionsProcessor');

const NOT_RECOGNIZED = "Desculpe, nao entendi."

var jarvis = {};

jarvis.running = true

jarvis.start = function() {
    while (this.running) {

        if (keyWordRecognized) {
                this.speak("Vai corinthians!");
        }

	    this.running = false

    }
}

jarvis.speak = function(text) {
    processor.process(processor.buildPlayAction(text), onError);
}

function onError()  {
    speak(NOT_RECOGNIZED)
}

function keyWordRecognized() {

}

exports = module.exports = jarvis;
