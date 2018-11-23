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

const Logger = require('../../jarvis/logger');
const logger = new Logger('API_CALLS');

const busyStatus = {'status': 'busy'};
const availableStatus = {'status': 'available'};
const successStatus = {'status': 'success'};

/**
 * Receives json actions and process them.
 */
router.post('/actions', function(req, res, next) {
    if (jarvis.busy) {
        res.json(busyStatus);
        return;
    }

    setSessionId(req, core);

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

    setSessionId(req, core);

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

    setSessionId(req, core);

    jarvis.processCommandText(req.body.text,
        () => {
            res.json(successStatus);
        }
    );
});

router.get('/status', function(req, res, next) {
    if (jarvis.busy) {
        logger.log('Sending status as busy');
        res.json(busyStatus);
    } else {
        logger.log('Sending status as available');
        res.json(availableStatus);
    }
});

/**
 * Retrieves the session id from the http headers, and saves it into the core.
 *
 * @param {*} req
 * @param {*} core
 *
 */
function setSessionId(req, core) {
    if (req && req.headers && req.headers.sessionid) {
        core.setSessionId(req.headers.sessionid);
    }
}

module.exports = router;
