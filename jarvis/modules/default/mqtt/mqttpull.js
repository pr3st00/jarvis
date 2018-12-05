'use strict';

const mqtt = require('mqtt');

const JarvisModule = require('../../jarvisModule');
let instance;

const MAX_RETRIES = 5;

/**
 * Subscribers and waits for a message to a mqtt broker based on the parameters
 */
class MqttPullModule extends JarvisModule {
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
        let username = parameters[3] ? parameters[3] : undefined;
        let password = parameters[4] ? parameters[4] : undefined;
        let clientId = parameters[5] ? parameters[5] : undefined;

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

        client.on('message', function(topic, message) {
            module.logger.log('Message arrived: ' + message.toString());
            client.end();
        });

        client.on('connect', function() {
            module.logger.log('Subscribing to topic: [' +
                topic + ']');

            client.subscribe(topic, function(err) {
                if (err) {
                    module.logger.log('Error subscribing to topic: ' + err);
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
        instance = new MqttPullModule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
