'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const ActionsProcessor = require('../../jarvis/services/actionsProcessor');
const actionsProcessor = new ActionsProcessor();

const core = require('../../jarvis/core');

router.post('/', upload.single('command'), function(req, res, next) {
    let jarvis = core.getJarvis();

    if (jarvis.busy) {
        res.json({'status': 'busy'});
    }

    actionsProcessor.setJarvis(jarvis);

    actionsProcessor.processCommandBuffer(req.file.buffer,
        () => {
            res.json({'status': 'success'});
        },
        (err) => {
            res.json({'status': err});
        }
    );
});

module.exports = router;
