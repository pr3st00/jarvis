'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const player = require('../../jarvis/services/player');
const Jarvis = require('../../jarvis/jarvis');
const jarvis = Jarvis.getInstance();

const Logger = require('../../jarvis/logger');
const logger = new Logger('API_CALLS');

const busyStatus = {'status': 'busy'};
const availableStatus = {'status': 'available'};
const successStatus = {'status': 'success'};

/**
 * Receives json actions and process them.
 */
router.post('/actions', function(req, res, next) {
    logger.log('Received action');

    if (isJarvisBusy(res, jarvis)) return;
    setSessionId(req, jarvis);

    jarvis.processActions(req.body,
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
    logger.log('Received command');

    if (isJarvisBusy(res, jarvis)) return;
    setSessionId(req, jarvis);

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
    logger.log('Received text');

    if (isJarvisBusy(res, jarvis)) return;

    if (!req.body || !req.body.text) {
        res.json({'status': 'Missing text'});
        return;
    }

    setSessionId(req, jarvis);

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

router.get('/language', function(req, res, next) {
    let value = jarvis.getConfig('language');
    logger.log('Jarvis currently speaks : ' + value);
    res.json({'language': value});
});

router.get('/disablesound', function(req, res, next) {
    player.disable();
    res.json(successStatus);
});

router.get('/enablesound', function(req, res, next) {
    player.enable();
    res.json(successStatus);
});

/**
 * Retrieves the session id from the http headers, and saves it into the core.
 *
 * @param {*} req
 * @param {*} jarvis
 *
 */
function setSessionId(req, jarvis) {
    let sessionId;

    if (req && req.headers && req.headers.sessionid) {
        sessionId = req.headers.sessionid;
    }

    jarvis.setSessionId(sessionId);
}

/**
 * Checks if jarvis is busy and responds accordingly
 *
 * @param {*} res
 * @param {*} jarvis
 *
 * @return {*} boolean
 */
function isJarvisBusy(res, jarvis) {
    if (jarvis.busy) {
        logger.log('Api call found jarvis busy');
        res.json(busyStatus);
        return true;
    }

    return false;
}

module.exports = router;
