'use strict'

var exceptions = require('./exceptions');
var factory = require('./factory');

const ACTIONS = [ "PLAY",  "HTTPGET", "HTTPOST", "EXECUTE", "STOP"];

/**
 * Process multipleActions executing each action with the processor
 * 
 * @param {*} multipleActions 
 * @param {*} onError
 */
function process(multipleActions, onError)
{
    try {
        return processActions(multipleActions, factory.getProcessor());
    } catch (err) {
        onError(err.message);
    }
}

/**
 * Processes all the actions using the processor provided.
 *   
 * @param {*} multipleActions 
 * @param {*} processor 
 */
function processActions(multipleActions, processor)
{
    if (! multipleActions)
    {
        throw new exceptions.ActionServiceError("actions cannot be empty!");
    }

    for (var i in multipleActions.actions)
    {
        processor.process(multipleActions.actions[i]);
    }
}

/**
 * Builds a action object for playing the message.
 * 
 * @param {*} message 
 */
function buildPlayAction(message)
{
        return { "actions" : [
        {
            "action" : "PLAY",
            "parameters" : [
                message
            ],
            "synchronous" : true
        }
    ]};
}

module.exports = { process, buildPlayAction }
