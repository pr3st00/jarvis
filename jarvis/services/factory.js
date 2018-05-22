'use strict';

const config = require('./config');

const WATSON = 'WATSON';
const implementation = config.getProcessorImplementation();

/**
 * Factory which provides the processor to be used
 *
 * @return {*} processor
 */
let getProcessor = function() {
    switch (implementation) {
        case WATSON:
            const watsonProcessor = require('./watson/processor');
            return watsonProcessor;
    }
};

module.exports = {getProcessor};
