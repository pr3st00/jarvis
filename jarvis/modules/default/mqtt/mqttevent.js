'use strict';

const mqtt = require('mqtt');

const JarvisModule = require('../../jarvisModule');
let instance;

const MAX_RETRIES = 5;

/**
 * Posts a message to a mqtt broker based on the parameters
 */
class MqttEventModule extends JarvisModule {
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
     */
    process(parameters) {
        let module = this;

        let url = parameters[1];
        let topic = parameters[2];
        let data = parameters[3];
        let username = parameters[4] ? parameters[4] : undefined;
        let password = parameters[5] ? parameters[5] : undefined;
        let clientId = parameters[6] ? parameters[6] : undefined;

        let options = {};
        let retries = 0;

        if (username && password) {
            options.username = username;
            options.password = password;
        }

        if (clientId) {
            options.clientId = clientId;
        }

        module.logger.log('Trying to connect to broker: [' + url
            + '] using options: ' + JSON.stringify(options));

        let client = mqtt.connect(url, options);

        client.on('error', (err) => {
            if (retries >= MAX_RETRIES) {
                module.logger.logError('Max retries reached, giving up..');
                client.end();
                return;
            }

            retries++;
            module.logger.log('Connection error (attempt '
                + retries + '): ' + err);
        });

        client.on('connect', function() {
            module.logger.log('Posting mqtt message to topic: [' + topic + ']');

            client.publish(topic, data, {}, (err) => {
                if (err) {
                    module.logger.logError('Error occurred: ' + err);
                } else {
                    module.logger.log('Message sent');
                }
            });

            client.end();
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
        instance = new MqttEventModule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
