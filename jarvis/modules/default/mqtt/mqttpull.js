'use strict';

const mqtt = require('mqtt');

const JarvisModule = require('../../jarvisModule');
let instance;

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
     * Process a request to subscriber and pull a message from a mqtt topic
     *
     * @param {*} parameters
     * @return {*} Promise
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

        module.logger.setDebug(true);

        module.logger.log('Trying to connect to broker: [' + url
            + '] using options: ' + JSON.stringify(options));

        let client = mqtt.connect(url, options);

        return new Promise((resolve, reject) => {
            client.on('error', (err) => {
                if (retries >= module.config.max_retries) {
                    module.logger.logError('Max retries reached, giving up..');
                    client.end();
                    resolve(module.buildPlayAction(
                        module.config.error_message));
                }

                retries++;
                module.logger.log('Connection error (attempt '
                    + retries + '): ' + err);
            });

            client.on('connect', function() {
                module.logger.log('Subscribing to topic: [' +
                    topic + ']');

                client.subscribe(topic, function(err) {
                    if (err) {
                        module.logger.log('Error subscribing to topic: ' + err);
                        resolve(module.buildPlayAction(
                            module.config.error_message));
                    } else {
                        module.logger.logDebug('Subscribed!');
                    }
                });
            });

            client.on('message', function(topic, message) {
                module.logger.log('Message arrived: ' + message.toString());
                client.end();

                let payload;

                try {
                    payload = JSON.parse(message.toString());
                } catch (err) {
                    module.logger.logError(
                        'Unable to parse message payload to a JSON object : '
                        + err);
                }

                resolve(payload);
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
