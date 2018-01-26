'use strict'

var exceptions = require('exceptions.js');

const ACTION_PLAY = "PLAY";

/**
 * Processes all the actions returned by the callback function
 * 
 * @param {*} request 
 * @param {*} callback 
 */
function processActions(request, callback)
{
    var actionList = callback(request);

    if (! actionList)
    {
        throw new exceptions.ActionServiceError("actionList cannot be empty!");
    }

    for (action in actionList)
    {
        processSingleAction(action);
    }
}

/**
 * Execute action 
 * 
 * @param {*} action 
 */
function processSingleAction(action)
{
    switch (action)
    {
        case ACTION_PLAY:
        break;

        default:
                processNonStandardAction(action);
        break;
    }

}

function processNonStandardAction(action)
{
    console.log("Processing non standard action : " + JSON.stringify(message));
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
            "action" : ACTION_PLAY,
            "parameters" : [
                message
            ],
            "synchronous" : true
        }
    ]};
}

module.exports = processAction;