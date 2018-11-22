'use strict';

const request = require('request');

const JarvisModule = require('../jarvisModule');
let instance;

/**
 * Tells the current weather conditions
 */
class PrinterModule extends JarvisModule {
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
        let name = parameters[1];

        let url = this.config.url + '/add/' + name;

        return new Promise((resolve, reject) => {
            request.get({
                url: url,
            },
            function(err, httpResponse, body) {
                if (err) {
                    resolve(module.buildPlayAction(
                        module.config.error_message));
                } else {
                    let message = module.config.success_message.replace(
                        '#user', name);
                    resolve(module.buildPlayAction(message));
                }
            });
        });
    };
}


/**
 * Returns an instance of this class
 *
 * @param{*} moduleName
 * @return {*} instance
 */
function getInstance(moduleName) {
    if (!instance) {
        instance = new PrinterModule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
