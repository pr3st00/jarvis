'use strict';

const request = require('request');

const JarvisModule = require('../jarvisModule');
let instance;

/**
 * Tells the current weather conditions
 */
class WeatherModule extends JarvisModule {
    /**
     * Constructor
     *
     * @param {*} name
     */
    constructor(name) {
        super(name);
    }

    /**
     * Process a request to tell the weather
     *
     * @param {*} parameters
     * @return {*} promise
     */
    process(parameters) {
        let module = this;

        let url = this.config.url + this.config.city
            + '/current?token=' + this.config.token;

        return new Promise((resolve, reject) => {
            request.get({
                url: url,
            },
            function(err, httpResponse, body) {
                if (err) {
                    resolve(module.buildPlayAction(module.config.error_message));
                } else {
                    resolve(module.buildResponse(JSON.parse(body)));
                }
            });
        });
    };

    /**
     * Builds the response json
     *
     * @param {*} body
     * @return {*} json
     */
    buildResponse(body) {
        let text = 'Hoje em ' + body.name + ', temperatura de ' +
            body.data.temperature + ' graus e '
            + body.data.condition;

        return this.buildPlayAction(text);
    }
}


/**
 * Returns an instance of this class
 *
 * @param{*} moduleName
 * @return {*} instance
 */
function getInstance(moduleName) {
    if (!instance) {
        instance = new WeatherModule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
