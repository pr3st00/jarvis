'use strict';

const express = require('express');
const router = express.Router();

const ActionsProcessor = require('../../jarvis/services/actionsProcessor');
const actionsProcessor = new ActionsProcessor();

const core = require('../../jarvis/listener/snowboy_listener');
let jarvis = core.getJarvis();

actionsProcessor.setJarvis(jarvis);

const successStatus = {'status': 'success'};
const users = {'status': 'success'};

router.get('/add/:user', function(req, res, next) {
    res.json(successStatus);
});

router.get('/show', function(req, res, next) {
    res.json(users);
});

router.get('/clear', function(req, res, next) {
    res.json(successStatus);
});

router.get('/3dprint', function(req, res, next) {
    res.json(successStatus);
});

module.exports = router;
