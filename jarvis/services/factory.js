'use strict';

const watsonProcessor = require('./watson/processor');
const config = require('./config');

const WATSON = 'WATSON';

/**
 * Factory which provides the processor to be used
 * @return {*} processor
 */
let getProcessor = function() {
    let implementation = config.getProcessorImplementation();

    switch (implementation) {
        case WATSON:
            return watsonProcessor;
    }
};

module.exports = {getProcessor};
