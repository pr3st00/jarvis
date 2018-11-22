'use strict';

const request = require('request');

const JarvisModule = require('../jarvisModule');
let instance;

/**
 * Interfaces with a 3d printer, adding, removing and listing printing jobs
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
     * Process a request to interface with the 3d printer
     *
     * @param {*} parameters
     * @return {*} promise
     */
    process(parameters) {
        let module = this;
        let action = parameters[1];
        let url;

        switch (action) {
            case 'add':
                let name = parameters[2];
                url = this.config.url + '/add/' + name;
                break;
            case 'list':
                url = this.config.url + '/show';
                break;
            case 'clear':
                url = this.config.url + '/clear';
                break;
            case 'print':
                url = this.config.url + '/3dprint';
                break;
            default:
                return buildPlayAction(module.config.error_message);
        }

        this.logger.log('Printer url is: ' + url);

        return new Promise((resolve, reject) => {
            request.get({
                url: url,
            },
                function(err, httpResponse, body) {
                    if (err) {
                        resolve(module.buildPlayAction(
                            module.config.error_message));
                    } else {
                        resolve(
                            module.buildResponse(
                                JSON.parse(body), action, parameters, module));
                    }
                });
        });
    };

    /**
     * Builds the response json
     *
     * @param {*} body
     * @param {*} action
     * @param {*} parameters
     * @param {*} module
     * @return {*} json
     */
    buildResponse(body, action, parameters, module) {
        let text;

        switch (action) {
            case 'add':
                let name = parameters[2];
                text = module.config.success_message.replace(
                    '#user', name);
                break;
            case 'list':
                text = module.parsePrintList(body);
                break;
            case 'clear':
                text = module.config.cleared_message;
                break;
            case 'print':
                text = module.config.print_message;
                break;
            default:
                text = module.config.error_message;
        }

        return this.buildPlayAction(text);
    }

    /**
     * Parses the print queue response
     *
     * @param {*} body
     * @return {*} message
     */
    parsePrintList(body) {
        return 'Alberto, jaozinho';
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
        instance = new PrinterModule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
