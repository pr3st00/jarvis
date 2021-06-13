/**
 * Listener implemenation for watson speech_to_text.
 *
 * It will work as detailed below:
 *
 * 1. A websocket is opened with watson STT service;
 * 2. When the services detects a phrase which starts with jarvis name,
 *    it will strip the name from the phrase, along with any trailing spaces;
 * 3. The resulting text is then send for jarvis to process.
 *
 */

'use strict';

const record = require('node-record-lpcm16');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

let Logger = require('../logger');

const RECOVER_TIME = 3000;

/**
 * CORE configuration
 */
const coreConfig = require('../config/core.json');

let processCommandIniTime;

let jarvis;
let processingCommand = false;

let logger = new Logger('WLISTENER');
logger.setDebug(true);

/**
 * Set jarvis
 *
 * @param {*} _jarvis
 */
function setJarvis(_jarvis) {
    jarvis = _jarvis;
}

/**
 * Retrieves the jarvis
 *
 * @return {*} jarvis
 */
function getJarvis() {
    return jarvis;
}

/**
 * Starts the core.
 */
function start() {
    jarvis.start();
    jarvis.processCommandText(coreConfig.initial_question, () => { });
    listen();
}

/**
 * Listen for commands
 */
function listen() {
    logger.log('Starting to listen now');

    const mic = record.start({
        threshold: 0,
        channels: 2,
        sampleRate: 44100,
        device: coreConfig.devices.mic,
        verbose: false,
    });

    let servicesConfig = jarvis.getConfig('services');
    let name = jarvis.getConfig('name');
    let nameRegex = '\\s*' + name + '\\s*';
    let sttConfig = servicesConfig.watson.speech_to_text;

    const speechToText = new SpeechToTextV1({
        authenticator: new IamAuthenticator({ apikey: sttConfig.apiKey }),
        serviceUrl: sttConfig.url
    });
      
    const webSocketparams = {
        content_type: 'audio/wav',
        timestamps: false,
        interim_results: true,
        model: sttConfig.model,
        inactivity_timeout: -1,
        acoustic_customization_id: sttConfig.acoustic_customization_id,
    };

    let sttStream = speechToText.recognizeUsingWebSocket(webSocketparams);
    sttStream.setEncoding('utf8');

    logger.logDebug(`Regex is ${nameRegex}`);
    
    sttStream.on('error', function(err) {
        if (err) {
            logger.logError(err);
            record.stop();
            setTimeout(function() {
                listen();
            }, RECOVER_TIME);
        }
    });

    sttStream.on('data', function(text) {
        logger.logDebug(`Got text: ${text}`);
        if (!processingCommand && !jarvis.busy) {
            if (text.includes(name)) {
                processingCommand = true;

                jarvis.waitForCommand(() => {
                    processCommand(
                        text.replace(new RegExp(nameRegex, 'gi'), ''));
                });
            }
        }
    });

    mic.pipe(sttStream);
}

/**
 * Process command
 *
 * @param{*} text
 */
function processCommand(text) {
    logger.log('Processing command.');

    processCommandIniTime = new Date().getTime();

    jarvis.processCommandText(text.replace(/\s+$/, ''), () => {
        /**
         * Total time spent for processing a command.
         */
        let totalTime = new Date().getTime() - processCommandIniTime;
        logger.log(`TOTAL COMMAND PROCESSING TIME = [${totalTime}] ms`);
        processingCommand = false;
    });
}

exports = module.exports = {start, getJarvis, setJarvis};
