'use strict';

const config = require('./config');

const PROVIDERS = {
    'WATSON': 'WATSON',
    'WIT': 'WIT',
};

const implementation = config.getProcessorImplementation();

/**
 * Factory which provides the processor to be used
 *
 * @return {*} processor
 */
let getProcessor = function() {
    switch (implementation) {
        case PROVIDERS.WATSON:
            const watsonProcessor = require('./watson/processor');
            return watsonProcessor;
        case PROVIDERS.WIT:
            const witProcessor = require('./wit/processor');
            return witProcessor;
    }
};

module.exports = {getProcessor};
