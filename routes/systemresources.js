'use strict';

const express = require('express');
const router = express.Router();

const si = require('systeminformation');

router.get('/', function(req, res, next) {
    let response = {};

    si.processes().then((data) => {
        response['processes'] = data.all;
        si.currentLoad().then((data) => {
            response['cpu'] = Math.round(data.currentload);
            si.mem().then((data) => {
                response['memory'] = Math.round(100 * data.active / data.total);
                res.send(response);
            });
        });
    }).catch((err) => console.error(err));
});

module.exports = router;
