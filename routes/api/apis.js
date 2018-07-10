'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const ActionsProcessor = require('../../jarvis/services/actionsProcessor');
const actionsProcessor = new ActionsProcessor();

const core = require('../../jarvis/core');
let jarvis = core.getJarvis();

actionsProcessor.setJarvis(jarvis);

const busyStatus = {'status': 'busy'};
const successStatus = {'status': 'success'};

/**
 * Receives json actions and process them.
 */
router.post('/actions', function(req, res, next) {
    if (jarvis.busy) {
        res.json(busyStatus);
        return;
    }

    actionsProcessor.process(req.body,
        (err) => {
            res.json({'status': err});
        },
        () => {
            res.json(successStatus);
        }
    );
});

/**
 * Receives a wav file in a multiform-data form and process it.
 */
router.post('/command', upload.single('command'), function(req, res, next) {
    if (jarvis.busy) {
        res.json(busyStatus);
        return;
    }

    jarvis.processCommandBuffer(req.file.buffer,
        () => {
            res.json(successStatus);
        }
    );
});

/**
 * Receives a text and process it.
 */
router.post('/text', function(req, res, next) {
    if (jarvis.busy) {
        res.json(busyStatus);
        return;
    }

    if (!req.body || !req.body.text) {
        res.json({'status': 'Missing text'});
        return;
    }

    jarvis.processCommandText(req.body.text,
        () => {
            res.json(successStatus);
        }
    );
});

module.exports = router;
