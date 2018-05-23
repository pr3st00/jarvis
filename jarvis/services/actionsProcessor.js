'use strict';

const exceptions = require('./exceptions');

/**
 * Actions processor
 */
class ActionsProcessor {
    /**
     * Default constructor
     */
    constructor() {
        this.factory = require('./factory');
    }

    /**
     * Sets jarvis instance
     *
     * @param {*} jarvis
     */
    setJarvis(jarvis) {
        this._jarvis = jarvis;
    }

    /**
     * Process multipleActions executing each action with the processor
     *
     * @param {*} multipleActions
     * @param {*} errorCallBack
     * @param {*} successCallBack
     */
    process(multipleActions, errorCallBack, successCallBack) {
        try {
            this.processActions(multipleActions, this.factory.getProcessor());
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
    processActions(multipleActions, processor, callback) {
        if (!multipleActions) {
            throw new exceptions.ActionServiceError('actions cannot be empty!');
        }

        processor.setJarvis(this._jarvis);

        for (const originalAction of multipleActions.actions) {
            let resultingAction = processor.process(originalAction);

            if (resultingAction) {
                if (resultingAction instanceof Promise) {
                    resultingAction.then(function(r) {
                        processor.process(r.actions[0]);
                    }).catch((err) => console.log(err));
                } else {
                    processor.process(resultingAction);
                }
            }
        }

        // callback();
    }

    /**
     * Process a command buffer.
     *
     * @param {*} buffer
     * @param {*} callback
     * @param {*} errorCallBack
     */
    processCommandBuffer(buffer, callback, errorCallBack) {
        this.getProcessor().processCommandBuffer(
            buffer, callback, errorCallBack);
    }

    /**
     * Process a text command
     *
     * @param {*} text
     * @param {*} callback
     * @param {*} errorCallBack
     */
    processCommandText(text, callback, errorCallBack) {
        this.getProcessor().processCommandText(
            text, callback, errorCallBack);
    }

    /**
     * Gets processor
     *
     * @return {*} processor
     */
    getProcessor() {
        let processor = this.factory.getProcessor();
        processor.setJarvis(this._jarvis);
        return processor;
    }
}

exports = module.exports = ActionsProcessor;
