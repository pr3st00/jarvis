'use strict'

var ogg = require('ogg');
var opus = require('node-opus');
var Speaker = require('speaker');
var fs = require('fs');

var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

function process(parameters)
{
    console.log("Invoking tts with text ", parameters[0]);

    var textToSpeech = new TextToSpeechV1({
        username: '89163d74-3d65-41e3-b97e-879bfc240c50',
        password: 'Kq4aGlRIcErq'
    });

    var params = {
        text: parameters[0],
        voice: 'en-US_AllisonVoice',
        accept: 'audio/wav'
    };    

    textToSpeech.synthesize(params).
        on('error', function(error) {
          console.log('Error:', error);
        }).
        //pipe(new ogg.Decoder()).
        //on('stream', function (opusStream) {
        //    opusStream.pipe(new ogg.Decoder()).
        //    pipe(new Speaker());
        //});
        pipe(fs.createWriteStream('/tmp/hello.wav'));
}

module.exports = { process };
