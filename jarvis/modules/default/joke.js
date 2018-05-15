'use strict';

const request = require('request');

const URL = 'https://us-central1-kivson.cloudfunctions.net/charada-aleatoria';
const JarvisModule = require('../jarvisModule');
let instance;

/**
 * Tells a joke
 */
class JokeModule extends JarvisModule {
    /**
     * Constructor
     *
     * @param {*} name
     */
    constructor(name) {
        super(name);
    }

    /**
    * Process and returns a joke
    *
    * @param {*} parameters
    * @return {*} promise
    */
    process(parameters) {
        let module = this;

        return new Promise((resolve, reject) => {
            request.get({
                url: URL,
                json: true,
            },
            function(err, httpResponse, body) {
                if (err) {
                    return resolve(
                        module.buildPlayAction(module.config.error_message));
                } else {
                    return resolve(
                        module.buildPlayAction(
                            buildResponse(body, module.config.error_message)));
                }
            });
        });
    }
}


/**
 * Builds the response
 *
 * @param {*} body
 * @param {*} defaultMessage
 * @return {*} string
 */
function buildResponse(body, defaultMessage) {
    let text = defaultMessage;

    if (body && body.pergunta && body.resposta) {
        text = body.pergunta.replace(/[\?]/g, '.') + ' ' + body.resposta;
    }

    return text;
}

/**
 * Returns an instance of this class
 *
 * @param{*} moduleName
 * @return {*} instance
 */
function getInstance(moduleName) {
    if (!instance) {
        instance = new JokeModule(moduleName);
    }
    return instance;
}

module.exports = {getInstance};
