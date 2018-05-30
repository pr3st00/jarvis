'use strict';

const request = require('request');

const config = require('../config').getConfig();
const fs = require('fs');
const player = require('../player');

const AUDIO_FILE = '/tmp/out.mp3';

const Logger = require('../../logger');
const logger = new Logger('TEXT_TO_SPEECH');
const Cache = require('../cache');
const cache = new Cache('WIT_TEXT_TO_SPEECH');

const serviceConfig = config.jarvis.services.wit.text_to_speech;

let requestOptions = {
    url: serviceConfig.url,
    method: 'GET',
};

/**
 * Process the request
 *
 * @param {*} singleAction
 * @param {*} jarvis
 */
function process(singleAction, jarvis) {
    let parameters = singleAction.parameters;

    logger.log('Caling tts with text [' + parameters[0] + ']');

    if (jarvis) {
        jarvis.emit('speaking', {status: 'SPEAKING', text: params.text});
    }

    let ini = new Date().getTime();
    let fromCache;

    if (serviceConfig.useCache) {
        fromCache = cache.getCacheValue(parameters[0]);

        if (fromCache) {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            player.playMp3(fromCache);
            return;
        }
    }

    // let url = 'https://api.voicerss.org/?key=f716f782b498444c95b14a63fe05a917&hl=pt-br&r=2&src=' + encodeURIComponent(params.text);

    requestOptions['qs'] = {
        src: parameters[0],
        key: serviceConfig.key,
        hl: serviceConfig.language,
        r: 2,
    };

    request.get(requestOptions)
        .pipe(fs.createWriteStream(AUDIO_FILE))
        .on('close', function() {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            player.playMp3(AUDIO_FILE);

            if (serviceConfig.useCache) {
                cache.putFileCacheValue(parameters[0], AUDIO_FILE);
            }
        });
}

module.exports = {process};
