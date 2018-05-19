'use strict';

const request = require('request');
let player = require('../../services/player');

const GOGGLE_YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=';
const MP3_FROMYOUTUBE_URL = 'https://www.1010diy.com/mp3?quality=128k&url=';
const YOUTUBE_BASE_VIDEO_URL = 'https://www.youtube.com/watch?v=';

const JarvisModule = require('../jarvisModule');
let instance;

// https://www.1010diy.com/mp3?url=<youtubeurl>&quality=128k
// https://www.googleapis.com/youtube/v3/search?part=snippet&q=capital&key=AIzaSyD44pJZWEADfGe9uj3ZCU8SuaThARkYUA4

/**
 * Plays musics based on the request
 */
class Musicmodule extends JarvisModule {
    /**
     * Constructor
     *
     * @param {*} name
     */
    constructor(name) {
        super(name);
    }

    /**
     * Process a request to play something
     *
     * @param {*} parameters
     */
    process(parameters) {
        let query = parameters[1];
        let module = this;

        if (this.config.local) {
            const musicConfig = require(this.config.config);

            this.findFile(query.toLowerCase(), musicConfig, function(list) {
                module.playList(list);
            });
        } else {
            this.findYouTube(query.toLowerCase(), function(list) {
                module.playList(list);
            });
        }
    };

    /**
     * Plays all files inside mp3List
     *
     * @param {*} mp3List
     * @return {*} action
     */
    playList(mp3List) {
        let module = this;

        if (mp3List && mp3List.length > 0) {
            player.playMp3(mp3List);
            return module.buildStopAction();
        } else {
            setTimeout(function() {
                return module.buildPlayAction(module.config.not_found_message);
            }, 2000);
        }
    }

    /**
     * Finds music on local filesystem matching query
     *
     * @param {*} query
     * @param {*} musicConfig
     * @param {*} callback
     */
    findFile(query, musicConfig, callback) {
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
    findYouTube(query, callback) {
        let url = GOGGLE_YOUTUBE_API + query + '&key=' +
            this.config.youtube_key + '&maxResults='
            + this.config.max_results;

        let module = this;

        request.get({
            url: url,
        },
        function(err, httpResponse, body) {
            if (err) {
                setTimeout(function() {
                    callback(module.buildPlayAction(module.config.not_found_message));
                }, 2000);
            } else {
                callback(buildResponse(JSON.parse(body)));
            }
        });
    }
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

/**
 * Returns an instance of this class
 *
 * @param{*} moduleName
 * @return {*} instance
 */
function getInstance(moduleName) {
    if (!instance) {
        instance = new Musicmodule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
