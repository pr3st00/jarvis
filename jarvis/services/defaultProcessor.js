'use strict'

function process(singleAction) {

    switch (singleAction.action) {

        case "EXECUTE":
            executeScript(singleAction.parameters);
            break;

    }
}

function executeScript(parameters) {

    console.log("[SCRIPT_CALL] Executing script [" + parameters[0] + "]");

    cmd.get(
        parameters[0],
        function (err, data, stderr) {
            console.log(err, data, stderr);
            callback(data);
        }
    );

}

module.exports = { process };