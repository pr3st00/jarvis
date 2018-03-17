'use strict'

var ogg = require('ogg');
var opus = require('node-opus');
var Speaker = require('speaker');

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const textToSpeech = new TextToSpeechV1({
  username: '<username>',
  password: '<password>',
  version: v1
});

function process(parameters)
{
    var params = {
        text = parameters[0],
        accept: 'audio/ogg; codec=opus'
    }

    textToSpeech.synthesize(params).
        pipe(new ogg.Decoder()).
        on('stream', function (opusStream) {
            opusStream.pipe(new opus.Decoder()).
            pipe(new Speaker());
});
}

module.exports = { process };