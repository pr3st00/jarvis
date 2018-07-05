'use strict';

const express = require('express');
const router = express.Router();

const ActionsProcessor = require('../../jarvis/services/actionsProcessor');
const actionsProcessor = new ActionsProcessor();

const core = require('../../jarvis/core');

router.post('/', function(req, res, next) {
    let jarvis = core.getJarvis();

    if (jarvis.busy) {
        res.json({'status': 'busy'});
    }

    actionsProcessor.setJarvis(jarvis);

    actionsProcessor.process(req.body,
        (err) => {
            res.json({'status': err});
        },
        () => {
            res.json({'status': 'success'});
        }
    );
});

module.exports = router;
