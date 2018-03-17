'use strict'

var watsonProcessor = require('./watson/processor');

const WATSON = "WATSON";

var getProcessor = function() 
{   
    var implementation = WATSON;

    switch (implementation)
    {
        case WATSON:
          return watsonProcessor; 
    }

    return undefined;
}

module.exports = { getProcessor };