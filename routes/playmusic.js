'use strict'

var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../jarvis/services/config').getConfig();
var buildPlayAction = require('../jarvis/services/actionsProcessor').buildPlayAction;
var buildStopAction = require('../jarvis/services/actionsProcessor').buildStopAction;

var serviceConfig = config.jarvis.services.music;
var musicConfig = require(serviceConfig.config);
var player = require('../jarvis/services/player');

const GOGGLE_YOUTUBE_API = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=";
const MP3_FROMYOUTUBE_URL = "https://www.1010diy.com/mp3?quality=128k&url=";
const YOUTUBE_BASE_VIDEO_URL = "https://www.youtube.com/watch?v=";

var local = false;
var _res;

// https://www.1010diy.com/mp3?url=<youtubeurl>&quality=128k
// https://www.googleapis.com/youtube/v3/search?part=snippet&q=capital&key=AIzaSyD44pJZWEADfGe9uj3ZCU8SuaThARkYUA4

router.get('/', function (req, res, next) {

    var query = req.query.music;
    var mp3List = [];
    _res = res;

    if (local) {
        mp3List = findFile(query.toLowerCase(), function (list) {
            playList(list);
        });
    }
    else {
        mp3List = findYouTube(query.toLowerCase(), function (list) {
            playList(list);
        });
    }

});

function playList(mp3List) {
    if (mp3List && mp3List.length > 0) {
        player.playMp3(mp3List);
        _res.send(buildStopAction());
    } else {
        setTimeout(function () {
            _res.send(buildPlayAction(serviceConfig.not_found_message))
        }, 2000);
    }
}

function findFile(query, callback) {

    var fileList = [];

    for (var i in musicConfig.entries) {
        var entry = musicConfig.entries[i];

        if (query.match(entry.genre.toLowerCase())) {
            fileList.push(serviceConfig.folder + "/" + entry.file);
        }

        for (var j in entry.keys) {
            if (query.match(entry.keys[j].toLowerCase())) {
                fileList.push(serviceConfig.folder + "/" + entry.file);
            }
        }
    }

    callback(fileList);
}

function findYouTube(query, callback) {

    var url = GOGGLE_YOUTUBE_API + query + "&key=" + serviceConfig.youtube_key + "&maxResults="
        + serviceConfig.max_results;

    //console.log("Calling youtube api [ url=" + url + "] ");

    request.get({
        url: url
    },
        function (err, httpResponse, body) {
            if (err) {
                setTimeout(function () {
                    _res.send(buildPlayAction(serviceConfig.not_found_message))
                }, 2000);
            }
            else {
                callback(buildResponse(JSON.parse(body)));
            }
        });

}

function buildResponse(response) {

    var urlList = [];

    if (response.items) {
        for (var i in response.items) {
            var item = response.items[i];

            if (item.id.kind == "youtube#video") {
                urlList.push(buildUrl(item.id.videoId));
            }
        }
    }

    return urlList;
}

function buildUrl(id) {
    return MP3_FROMYOUTUBE_URL + YOUTUBE_BASE_VIDEO_URL + id;
}

module.exports = router;
