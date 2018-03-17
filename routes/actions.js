'use strict';

var express = require('express');
var router = express.Router();
var processor = require('actionsProcessor.js');

router.post('/', function(req, res, next) {
        res.json(processor.process(req));
});

module.exports = router;
