'use strict';

const request = require('request');

const JarvisModule = require('../jarvisModule');
let instance;

/**
 * Tells a joke
 */
class NewsModule extends JarvisModule {
    /**
     * Constructor
     *
     * @param {*} name
     */
    constructor(name) {
        super(name);
    }

    /**
    * Process and returns latest news
    *
    * @param {*} parameters
    * @return {*} promise
    */
    process(parameters) {
        let module = this;
        let url = this.config.url + '&pagesize=' + this.config.max_results +
            '&apiKey=' + this.config.key;

        return new Promise((resolve, reject) => {
            request.get({
                url: url,
                json: true,
            },
                function(err, httpResponse, body) {
                    if (err) {
                        return resolve(
                            module.buildPlayAction(
                                module.config.error_message));
                    } else {
                        return resolve(
                            module.buildPlayAction(
                                buildResponse(body,
                                    module.config.error_message)));
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
    let text = '';

    if (body && body.articles) {
        for (let article of body.articles) {
            text += article.title.replace(/V.?deo.!/g, '') + '. ';
        }
    } else {
        text = defaultMessage;
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
        instance = new NewsModule(moduleName);
    }
    return instance;
}

module.exports = {getInstance};
