'use strict';

const request = require('request');

const JarvisModule = require('../jarvisModule');
let instance;

const MOUTH_ON_URL = 'http://127.0.0.1:1880/mouth/on';
const MOUTH_OFF_URL = 'http://127.0.0.1:1880/mouth/off';

/**
 * Defines actions which can be taken before and after speaking
 */
class SpeakModule extends JarvisModule {
    /**
     * Constructor
     *
     * @param {*} name
     */
    constructor(name) {
        super(name);
    }

    /**
     * Process a request
     *
     * @param {*} parameters
     */
    process(parameters) {
        let module = this;

        if (!module.config.enabled) {
            return;
        }

        switch (parameters[1]) {
            case 'BEFORE':
            request.get(MOUTH_ON_URL).on('error', function(err) {
                console.log(err);
            });
            break;

            default:
            request.get(MOUTH_OFF_URL).on('error', function(err) {
                console.log(err);
            });
        }
    };
}


/**
 * Returns an instance of this class
 *
 * @param {*} moduleName
 * @return {*} instance
 */
function getInstance(moduleName) {
    if (!instance) {
        instance = new SpeakModule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
