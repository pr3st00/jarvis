'use strict'

var wav = require('wav');
var Speaker = require('speaker');

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
        voice: 'pt-BR_IsabelaVoice',
        accept: 'audio/wav'
    };    

    var reader = new wav.Reader();

    reader.on('format', function (format) {
        reader.pipe(new Speaker(format));
    });

    reader.on('error', function (err) {
        console.error('Reader error: %s', err);
    });

    textToSpeech.synthesize(params).
        on('error', function(error) {
          console.log('Error:', error);
        }).
        pipe(reader);
}

module.exports = { process };
