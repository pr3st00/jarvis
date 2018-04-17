var express = require('express');
var router = express.Router();

const si = require('systeminformation');

router.get('/', function (req, res, next) {
    var response = {};

    si.processes().then(data => {
        response['processes'] = data.running;
        si.currentLoad().then(data => {
            response['cpu'] = Math.round(data.currentload);
            si.mem().then(data => {
                response['memory'] = Math.round(100 * data.used / data.total);
                res.send(response);
            })
        })

    }).catch(err => console.error(err));
});

module.exports = router;
