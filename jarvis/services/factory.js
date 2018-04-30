'use strict'

var watsonProcessor = require('./watson/processor');
var config = require('./config');

const WATSON = "WATSON";

/**
 * Factory which provides the processor to be used 
 * 
 */
var getProcessor = function () {
    var implementation = config.getProcessorImplementation();

    switch (implementation) {
        case WATSON:
            return watsonProcessor;
    }

}

module.exports = { getProcessor };