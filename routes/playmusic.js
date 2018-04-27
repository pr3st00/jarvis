'use strict'

var express = require('express');
var router = express.Router();
var config = require('../jarvis/services/config').getConfig();
var buildPlayAction = require('../jarvis/services/actionsProcessor').buildPlayAction;
var buildStopAction = require('../jarvis/services/actionsProcessor').buildStopAction;

var serviceConfig = config.jarvis.services.music;
var musicConfig = require(serviceConfig.config);
var player = require('../jarvis/services/player');

router.get('/', function (req, res, next) {

    var query = req.query.music;
    
    var file = findFile(query.toLowerCase());

    if (file) {
        player.playMp3(serviceConfig.folder + "/" + file);
        res.send(buildStopAction());
    } else {
        res.send(buildPlayAction(serviceConfig.not_found_message));
    }

});

function findFile(query) {
    for (var i in musicConfig.entries) {
        var entry = musicConfig.entries[i];

        if (query.match(entry.genre.toLowerCase())) {
            return entry.file;
        }

        for (var j in entry.keys) {
            if (query.match(entry.keys[j].toLowerCase())) {
                return entry.file;
            }
        }
    }

    return undefined;
}

module.exports = router;
