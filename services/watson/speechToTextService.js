'use strict'

var actionProcessor = require('../actionsProcessor.js');

function process(request)
{
    return actionProcessor.processActions(request, watsonSpeechToText(request));
}

function watsonSpeechToText(request)
{
    var message = "Hello from Watson!";

    return actionProcessor.buildPlayJson(message);
}

modules.export = process;