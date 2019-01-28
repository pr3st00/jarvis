'use strict';

const Vr = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const cmd = require('node-cmd');

const JarvisModule = require('../../jarvisModule');
let instance;

const IMAGE_FILE = 'imagetorec.jpg';
const WEBCAM_SCRIPT = 'jarvis/scripts/webcam.sh ';
const IMAGE_PATH = 'public/images/photos';

/**
 * Tells what is in front of Jarvis
 */
class ImageRecModule extends JarvisModule {
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
     * @return {*} promise
     */
    process(parameters) {
        let module = this;

        let visualRecognition = new Vr({
            version: module.config.version,
            iam_apikey: module.config.key,
        });

        let owners = ['IBM'];
        let threshold = 0.6;

        return new Promise((resolve, reject) => {
            cmd.get(
                WEBCAM_SCRIPT + IMAGE_FILE,
                (err, data, stderr) => {
                    if (err) {
                        module.logger.logError('Error: ' + err);
                        resolve(module.buildPlayAction(
                            module.config.error_message));
                    } else {
                        let imagesFile =
                            fs.createReadStream(IMAGE_PATH + '/' + IMAGE_FILE);

                        let params = {
                            images_file: imagesFile,
                            owners: owners,
                            threshold: threshold,
                            headers: {
                                'Accept-Language': module.config.language,
                            },
                        };

                        visualRecognition.classify(
                            params,
                            function(err, response) {
                                if (err) {
                                    module.logger.logError('Error: ' + err);
                                    resolve(module.buildPlayAction(
                                        module.config.error_message));
                                } else {
                                    module.logger.log('Response: ' +
                                        JSON.stringify(response));
                                    resolve(
                                        module.buildResponse(response,
                                            module.config.success_messages,
                                            module.config.error_message));
                                }
                            });
                    }
                }
            );
        });
    };

    /**
     * Builds the response json
     *
     * @param {*} body
     * @param {*} messages
     * @param {*} errorMessage
     * @return {*} json
     */
    buildResponse(body, messages, errorMessage) {
        let text = messages[Math.floor(Math.random() * messages.length)];

        let bestMatch = this.getBestMatches(body);

        if (bestMatch) {
            text = text.replace('#item', this.getBestMatches(body));
        } else {
            text = errorMessage;
        }

        return this.buildPlayAction(text);
    }

    /**
     * Finds the best matches from json
     *
     * @param {*} body
     * @return {*} string
     */
    getBestMatches(body) {
        let bestMatch = {'class': undefined};

        if (body.images[0].classifiers &&
                    body.images[0].classifiers[0].classes) {
            bestMatch = body.images[0].classifiers[0].classes[0];

            for (let image in body.images[0].classifiers[0].classes) {
                if (Number(image.score) > Number(bestMatch.score)) {
                    bestMatch = image;
                }
            }
        }

        return bestMatch.class;
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
        instance = new ImageRecModule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
