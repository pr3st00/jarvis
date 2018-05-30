'use strict';

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
     * @param {*} text
     * @param {*} intents
     * @param {*} entities
     */
    constructor(text, intents, entities) {
        this.text = text;
        this.intents = intents;
        this.entities = entities;
    }

    /**
     * Build the actions
     *
     * @return {*} actions
     */
    buildActions() {
        let actionsList = actions.buildActionsList();

        if (this.intents.includes('horas')) {
            let date = new Date();
            let minutes = date.getMinutes();
            let hour = date.getHours();

            let timeText = 'Sao ' + hour + (hour > 1 ? ' horas' : ' hora') +
                ' e ' +
                minutes + (minutes > 1 ? ' minutos' : ' minuto') + '!';

            actionsList = actions.buildPlayAction(timeText);
        } else if (this.intents.includes('sobrevoce')) {
            actionsList = actions.buildPlayAction('Sou sua assistente virtual');
        } else if (this.intents.includes('previsaotempo')) {
            actionsList.actions.push(
                actions.buildAction('MODULE', ['weather']));
        } else if (this.intents.includes('piada')) {
            actionsList.actions.push(
                actions.buildAction('MODULE', ['joke']));
        } else if (this.intents.includes('netflix')) {
            actionsList.actions.push(
                actions.buildAction('MODULE', ['tv', 'netflix']));
        } else if (this.intents.includes('desligartv')) {
            actionsList.actions.push(
                actions.buildAction('MODULE', ['tv', 'turnoff']));
        } else if (this.intents.includes('noticias')) {
            actionsList.actions.push(
                actions.buildAction('MODULE', ['news']));
        } else if (this.intents.includes('tirarfoto')) {
            actionList.actions.push(
                actions.buildPlayAction('diga x'));
            actionsList.actions.push(
                actions.buildAction('EXECUTE',
                    ['/home/pi/jarvis/jarvis/scripts/webcam.sh']));
        } else if (this.intents.includes('tocarmusica')) {
            let searchString = this.text.replace(/tocar?/g, '');
            searchString = searchString.replace(/uma?/g, '');
            searchString = searchString.replace(/ /g, '');

            actionList.actions.push(
                actions.buildPlayAction('ok, procurando'));
            actionsList.actions.push(
                actions.buildAction('MODULE', ['music', searchString]));
        } else if (this.intents.includes('tocarvideo')) {
            let searchString = this.text.replace(/assisti.?/g, '');
            searchString = searchString.replace(/v.deo/g, '');
            searchString = searchString.replace(/uma?/g, '');
            searchString = searchString.replace(/ /g, '');

            actionList.actions.push(
                actions.buildPlayAction('ok, procurando'));
            actionsList.actions.push(
                actions.buildAction('MODULE', ['video', searchString]));
        }

        return actionsList;
    }
}

module.exports = ActionMapper;
