'use strict';

const Logger = require('../logger');
const logger = new Logger('ACTION_MAPPER');

const Actions = require('./actions');
const actions = new Actions();

/**
 * Maps intents and entities to actions
 *
 */
class ActionMapper {
    /**
     * Constructor
     *
     * @param {*} intents
     * @param {*} entities
     */
    constructor(intents, entities) {
        this.intents = intents;
        this.entities = entities;
    }

    /**
     *
     * @return {*} actions
     */
    buildActions() {
        if (this.intents.includes('horas')) {
            return actions.buildPlayAction('Sao 19 horas');
        } else if (this.intents.includes('sobrevoce')) {
            return actions.buildPlayAction('Sou sua assistente virtual');
        }
    }
}

module.exports = ActionMapper;
