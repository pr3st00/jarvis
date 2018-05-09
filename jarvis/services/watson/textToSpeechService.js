'use strict';

const config = require('../config').getConfig();
const fs = require('fs');
const player = require('../player');

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const AUDIO_FILE = '/tmp/out.wav';

const Logger = require('../../logger');
const logger = new Logger('TEXT_TO_SPEECH');
const Cache = require('../cache');
const cache = new Cache('TEXT_TO_SPEECH');

/**
 * Process the request
 *
 * @param {*} singleAction
 * @param {*} jarvis
 */
function process(singleAction, jarvis) {
    let parameters = singleAction.parameters;

    logger.log('Caling tts with text [' + parameters[0] + ']');

    let serviceConfig = config.jarvis.services.text_to_speech;

    let textToSpeech = new TextToSpeechV1({
        username: serviceConfig.username,
        password: serviceConfig.password,
    });

    let params = {
        text: parameters[0],
        voice: serviceConfig.voice,
        accept: 'audio/wav',
    };

    jarvis.emit('speaking', {status: 'SPEAKING', text: params.text});

    let ini = new Date().getTime();
    let fromCache;

    if (serviceConfig.useCache) {
        fromCache = cache.getCacheValue(params.text);

        if (fromCache) {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            player.play(fromCache);
            return;
        }
    }

    textToSpeech.synthesize(params)
        .pipe(fs.createWriteStream(AUDIO_FILE))
        .on('close', function() {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            player.play(AUDIO_FILE);

            if (serviceConfig.useCache) {
                cache.putFileCacheValue(params.text, AUDIO_FILE);
            }
        });
}

module.exports = {process};
