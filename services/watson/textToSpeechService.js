'use strict'

var actionProcessor = require('../actionsProcessor.js');

function process(request)
{
    return actionProcessor.processActions(request, watsonTextToSpeech(request));
}

function watsonTextToSpeech(request)
{
    var message = "Hello from Watson!";

    return actionProcessor.buildPlayJson(message);
}

modules.export = process;