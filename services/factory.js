'use strict'

const SPEECH_TO_TEXT = "SPEECH_TO_TEXT";
const WATSON = "WATSON";

var speechToTextService = require('watson/speechToTextService.js');

function getProcessor(processorName, implementation) 
{   
    switch (processorName)
    {
        case SPEECH_TO_TEXT:
          if (WATSON == implementation) return speechToTextService; 
    }

    return undefined;
}

modules.export = getProcessor, SPEECH_TO_TEXT;