'use strict'

var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../jarvis/services/config').getConfig();
var buildPlayAction = require('../jarvis/services/actionsProcessor').buildPlayAction;

const URL = "https://us-central1-kivson.cloudfunctions.net/charada-aleatoria";
const ERROR_MESSAGE = "Nao consegui achar uma boa.";

router.get('/', function (req, res, next) {

    request.get({
        url: URL,
        json: true,
        headers: {
            'Header': "A"
        }
    },
        function (err, httpResponse, body) {
            if (err) {
                res.send(buildPlayAction(ERROR_MESSAGE));
            }
            else {
                res.send(buildResponse(body));
            }
        });

});

function buildResponse(body) {
    //{
    //"id": 637,
    //"pergunta": "O que é que a televisão foi fazer no dentista?",
    //"resposta": "Tratamento de canal."
    //}
    var text = body.pergunta + "." + body.resposta;

    return buildPlayAction(text);
}

module.exports = router;
