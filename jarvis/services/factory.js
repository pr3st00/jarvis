'use strict'

var watsonProcessor = require('./watson/processor');
var config = require('./config');

const WATSON = "WATSON";

var getProcessor = function () {
    var implementation = config.getProcessorImplementation();

    switch (implementation) {
        case WATSON:
            return watsonProcessor;
    }

    return undefined;
}

module.exports = { getProcessor };