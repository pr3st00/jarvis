'use strict'

var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../jarvis/services/config').getConfig();
var buildPlayAction = require('../jarvis/services/actionsProcessor').buildPlayAction;

router.get('/', function (req, res, next) {

    var serviceConfig = config.jarvis.services.weather;

    var url = serviceConfig.url + serviceConfig.city
        + "/current?token=" + serviceConfig.token;

    request.get({
        url: url
    },
        function (err, httpResponse, body) {
            if (err) {
                res.send(buildPlayAction(serviceConfig.error_message));
            }
            else {
                res.send(buildResponse(JSON.parse(body)));
            }
        });

});

function buildResponse(body) {
    //{"id":4456,"name":"Campinas","state":"SP","country":"BR ",
    //"data":{"temperature":19,"wind_direction":"ESE","wind_velocity":15,"humidity":68,
    //"condition":"Alguma nebulosidade","pressure":1022,"icon":"2","sensation":19,"date":"2018-04-19 22:09:11"}}
    var text = "Hoje em " + body.name + ", temperatura de " + body.data.temperature + " graus e "
        + body.data.condition;

    return buildPlayAction(text);
}

module.exports = router;
