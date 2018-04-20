'use strict'

var exceptions = require('./exceptions');
var factory = require('./factory');

const ACTIONS = ["PLAY", "HTTPGET", "HTTPOST", "EXECUTE", "STOP"];
var _jarvis;

/**
 * 
 * @param {*} jarvis 
 */
function setJarvis(jarvis) {
    _jarvis = jarvis;
}

/**
 * Process multipleActions executing each action with the processor
 * 
 * @param {*} multipleActions 
 * @param {*} errorCallBack
 * @param {*} successCallBack
 */
function process(multipleActions, errorCallBack, successCallBack) {
    try {
        processActions(multipleActions, factory.getProcessor());
        successCallBack();
    } catch (err) {
        errorCallBack(err.message);
    }
}

/**
 * Processes all the actions using the processor provided.
 *   
 * @param {*} multipleActions 
 * @param {*} processor 
 * @param {*} callback
 */
function processActions(multipleActions, processor, callback) {
    if (!multipleActions) {
        throw new exceptions.ActionServiceError("actions cannot be empty!");
    }

    processor.setJarvis(_jarvis);

    for (var i in multipleActions.actions) {
        var action = processor.process(multipleActions.actions[i]);

        if (action) {
            if (action instanceof Promise) {
                action.then(function(r) {
                    processor.process(r.actions[0]);
                })
            }
            else {
                processor.process(action);
            }
        }
    }

    //callback();
}

/**
 * Builds a action object for playing the message.
 * 
 * @param {*} message 
 */
function buildPlayAction(message) {
    return {
        "actions": [
            {
                "action": "PLAY",
                "parameters": [
                    message
                ],
                "synchronous": true
            }
        ]
    };
}

module.exports = { process, buildPlayAction, setJarvis }
