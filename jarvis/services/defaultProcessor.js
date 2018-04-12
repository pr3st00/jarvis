'use strict'

function process(singleAction) {

    switch (singleAction.action) {

        case "EXECUTE":
            ttsService.process(singleAction.parameters);
            break;

    }
}

module.exports = { process };