'use strict';

var express = require('express');
var router = express.Router();
var factory = require('../jarvis/services/factory.js');

router.post('/', function(req, res, next) {

    var response = factory.getProcessor(factory.SPEECH_TO_TEXT, factory.WATSON);

    res.json(response);

});

module.exports = router;
