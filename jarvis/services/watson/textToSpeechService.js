'use strict';

const config = require('../config').getConfig();
const exceptions = require('../exceptions');
const fs = require('fs');
const player = require('../player');

const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const AUDIO_FILE = '/tmp/out.wav';

const Logger = require('../../logger');
const logger = new Logger('TEXT_TO_SPEECH');
const Cache = require('../cache');
const cache = new Cache('TEXT_TO_SPEECH');

const ModuleFactory = require('../../modules/moduleFactory');
const moduleFactory = new ModuleFactory();

const serviceConfig = config.jarvis.services.watson.text_to_speech;
const language = config.jarvis.language;

let animationModule = moduleFactory.getModule('speakanimations');
  
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

    let params = {
        text: text,
        voice: serviceConfig.voice,
        accept: 'audio/wav',
    };

    let ini = new Date().getTime();
    let fromCache;

    let cacheKey = language + '|' + params.text;

    if (serviceConfig.useCache) {
        fromCache = cache.getCacheValue(cacheKey);

        if (fromCache) {
            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            beforeSpeak();
            player.play(fromCache, () => afterSpeak(jarvis));
            return;
        }
    }

    const textToSpeech = new TextToSpeechV1({
        authenticator: new IamAuthenticator({ apikey: serviceConfig.apiKey }),
        serviceUrl: serviceConfig.url
    });

    textToSpeech.synthesize(params)
        .then(response => {
            const audio = response.result;
            return textToSpeech.repairWavHeaderStream(audio);
        })
        .then(repairedFile => {
            fs.writeFileSync(AUDIO_FILE, repairedFile);

            let timeTaken = new Date().getTime() - ini;
            logger.log('Took: (' + timeTaken + ') ms.');

            beforeSpeak();
            player.play(AUDIO_FILE, () => afterSpeak(jarvis));

            if (serviceConfig.useCache) {
                cache.putFileCacheValue(cacheKey, AUDIO_FILE);
            }
        })
        .catch(err => {
            logger.logError(err);
    });
}

/**
 * Action to be executed before speaking
 */
function beforeSpeak() {
    if (animationModule) {
        animationModule.process(['speakanimations', 'BEFORE']);
    }
}

/**
 * Action to be executed after speaking
 *
 * @param {*} jarvis
 */
function afterSpeak(jarvis) {
    jarvis.busy = false;

    if (animationModule) {
        animationModule.process(['speakanimations', 'AFTER']);
    }
}

module.exports = {process};
