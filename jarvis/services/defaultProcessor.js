'use strict'

var Logger = require('../logger');
var logger = new Logger("DEFAULT_PROCESSOR");

function process(singleAction) {

    switch (singleAction.action) {

        case "EXECUTE":
            executeScript(singleAction.parameters);
            break;

    }
}

function executeScript(parameters) {
    logger.log("[SCRIPT_CALL] Executing script [" + parameters[0] + "]");

    cmd.get(
        parameters[0],
        function (err, data, stderr) {
            logger.log(err, data, stderr);
            callback(data);
        }
    );

}

module.exports = { process };