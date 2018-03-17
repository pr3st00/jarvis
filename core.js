'use strict';

var processor = require('./services/actionsProcessor');

var jarvis = {};

jarvis.running = true

jarvis.start = function() {
    while (this.running) {

        if (keyWordRecognized)
            {
                this.speak("Pois nao!");
            }

    }
}

jarvis.speak = function(text) {
    processor.process(processor.buildPlayAction(text));
}

function onError()  {
    speak("Desculpe, nao entendi.")
}

function keyWordRecognized() {

}

exports = module.exports = jarvis;
