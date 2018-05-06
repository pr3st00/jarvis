'use strict';

const request = require('request');

const commands = {
    'netflix': 'AAAAAgAAABoAAAB8Aw==',
    'turnoff': 'AAAAAQAAAAEAAAAvAw==',
};

const JarvisModule = require('../jarvisModule');
let instance;

/**
 * Module for controlling TV
 */
class BraviaTvModule extends JarvisModule {
    /**
     * Constructor
     *
     * @param {*} name
     */
    constructor(name) {
        super(name);
    }

    /**
     * Process tv commands
     *
     * @param {*} parameters
     * @return {*} promise
     */
    process(parameters) {
        let url = 'http://' + this.config.ip + '/sony/IRCC';

        let command = parameters[1];

        if (!command) {
            return buildPlayAction(this.config.error_message);
        }

        let ircc = commands[command];

        if (!ircc) {
            return buildPlayAction(this.config.error_message);
        }

        let module = this;

        return new Promise((resolve, reject) => {
            request.post({
                url: url,
                body: buildRequest(ircc),
                headers: {
                    'X-Auth-PSK': module.config.key,
                },
            },
            function(err, httpResponse, body) {
                if (err) {
                    resolve(module.buildPlayAction(module.config.error_message));
                } else {
                    resolve(module.buildPlayAction(module.config.success_message));
                }
            });
        });
    };
}


/**
 * Builds a soap request for controlling the tv
 *
 * @param {*} ircc
 * @return {*} string
 */
function buildRequest(ircc) {
    let string = '<?xml version="1.0" encoding="utf-8"?>' +
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
        '   <s:Body> ' +
        '       <u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">' +
        ' <IRCCCode>' + ircc + '</IRCCCode>' +
        '</u:X_SendIRCC>' +
        '</s:Body>' +
        '</s:Envelope> ';

    return string;
}

/**
 * Returns an instance of this class
 *
 * @param{*} moduleName
 * @return {*} instance
 */
function getInstance(moduleName) {
    if (!instance) {
        instance = new BraviaTvModule(moduleName);
    }
    return instance;
}

module.exports = {getInstance};
