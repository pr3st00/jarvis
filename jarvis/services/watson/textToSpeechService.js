'use strict';

const config = require('../config').getConfig();
const exceptions = require('../exceptions');
const fs = require('fs');
const player = require('../player');

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const AUDIO_FILE = '/tmp/out.wav';

const Logger = require('../../logger');
const logger = new Logger('TEXT_TO_SPEECH');
const Cache = require('../cache');
const cache = new Cache('TEXT_TO_SPEECH');

const serviceConfig = config.jarvis.services.watson.text_to_speech;

/**
 * Process the request
 *
 * @param {*} singleAction
 * @param {*} jarvis
 */
function process(singleAction, jarvis) {
    jarvis.busy = true;

    let parameters = singleAction.parameters;
    let text = parameters[0];

    if (!text) {
        throw new exceptions.ActionServiceError('Text cannot be empty!');
    }

    logger.log('Caling tts with text [' + text + ']');

    jarvis.emit('speaking', {status: 'SPEAKING', text: text});

    if (text.startsWith('http')) {
        player.playMp3(text);
        jarvis.busy = false;
        return;
    }

    let textToSpeech = new TextToSpeechV1({
        username: serviceConfig.username,
        password: serviceConfig.password,
    });

    let params = {
        text: text,
        voice: serviceConfig.voice,
        accept: 'audio/wav',
    };

    let ini = new Date().getTime();
    let fromCache;

    if (serviceConfig.useCache) {
        fromCache = cache.getCacheValue(params.text);

        if (fromCache) {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            player.play(fromCache, () => jarvis.busy = false);
            return;
        }
    }

    textToSpeech.synthesize(params)
        .pipe(fs.createWriteStream(AUDIO_FILE))
        .on('close', function() {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            player.play(AUDIO_FILE, () => jarvis.busy = false);

            if (serviceConfig.useCache) {
                cache.putFileCacheValue(params.text, AUDIO_FILE);
            }
        });
}

module.exports = {process};
