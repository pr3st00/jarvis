'use strict';

const request = require('request');
const config = require('../../services/config').getConfig();
const buildPlayAction =
 require('../../services/actionsProcessor').buildPlayAction;
const buildStopAction =
 require('../../services/actionsProcessor').buildStopAction;

const serviceConfig = config.jarvis.services.music;
const musicConfig = require(serviceConfig.config);
let player = require('../../services/player');

const GOGGLE_YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=';
const MP3_FROMYOUTUBE_URL = 'https://www.1010diy.com/mp3?quality=128k&url=';
const YOUTUBE_BASE_VIDEO_URL = 'https://www.youtube.com/watch?v=';

let local = false;

// https://www.1010diy.com/mp3?url=<youtubeurl>&quality=128k
// https://www.googleapis.com/youtube/v3/search?part=snippet&q=capital&key=AIzaSyD44pJZWEADfGe9uj3ZCU8SuaThARkYUA4

/**
 *
 * @param {*} parameters
 */
function process(parameters) {
    let query = parameters[1];

    if (local) {
        findFile(query.toLowerCase(), function(list) {
            playList(list);
        });
    } else {
        findYouTube(query.toLowerCase(), function(list) {
            playList(list);
        });
    }
};

/**
 * Plays all files inside mp3List
 *
 * @param {*} mp3List
 * @return {*} action
 */
function playList(mp3List) {
    if (mp3List && mp3List.length > 0) {
        player.playMp3(mp3List);
        return buildStopAction();
    } else {
        setTimeout(function() {
            return buildPlayAction(serviceConfig.not_found_message);
        }, 2000);
    }
}

/**
 * Finds music on local filesystem matching query
 *
 * @param {*} query
 * @param {*} callback
 */
function findFile(query, callback) {
    let fileList = [];

    for (const entry of musicConfig.entries) {
        if (query.match(entry.genre.toLowerCase())) {
            fileList.push(serviceConfig.folder + '/' + entry.file);
        }

        for (const key of entry.keys) {
            if (query.match(key.toLowerCase())) {
                fileList.push(serviceConfig.folder + '/' + entry.file);
            }
        }
    }

    callback(fileList);
}

/**
 * Finds music on youtube matching query
 *
 * @param {*} query
 * @param {*} callback
 */
function findYouTube(query, callback) {
    let url = GOGGLE_YOUTUBE_API + query + '&key=' +
     serviceConfig.youtube_key + '&maxResults='
        + serviceConfig.max_results;

    // console.log("Calling youtube api [ url=" + url + "] ");

    request.get({
        url: url,
    },
        function(err, httpResponse, body) {
            if (err) {
                setTimeout(function() {
                    callback(buildPlayAction(serviceConfig.not_found_message));
                }, 2000);
            } else {
                callback(buildResponse(JSON.parse(body)));
            }
        });
}

/**
 * Builds a response
 *
 * @param {*} response
 * @return {*} response
 */
function buildResponse(response) {
    let urlList = [];

    if (response.items) {
        for (let item of response.items) {
            if (item.id.kind == 'youtube#video') {
                urlList.push(buildUrl(item.id.videoId));
            }
        }
    }

    return urlList;
}

/**
 * Builds the url to download the mp3 from
 *
 * @param {*} id
 * @return {*} string
 */
function buildUrl(id) {
    return MP3_FROMYOUTUBE_URL + YOUTUBE_BASE_VIDEO_URL + id;
}

module.exports = {process};
