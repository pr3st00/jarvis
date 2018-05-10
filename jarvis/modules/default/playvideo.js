'use strict';

const request = require('request');
const cmd = require('node-cmd');

const GOGGLE_YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=';
const YOUTUBE_BASE_VIDEO_URL = 'https://www.youtube.com/embed/';
const OPEN_VIDEO_COMMAND = '/usr/bin/chromium-browser -start-fullscreen';

const JarvisModule = require('../jarvisModule');
let instance;

/**
 * Plays videos based on the request
 */
class VideoModule extends JarvisModule {
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
     * @return {*} promise
     */
    process(parameters) {
        let query = parameters[1];
        let module = this;

        return new Promise((resolve, reject) => {
            module.findYouTube(query.toLowerCase(), (list, err) => {
                if (err) {
                    resolve(module.buildPlayAction(
                        module.config.not_found_message));
                } else {
                    module.openVideo(list, (err) => {
                        if (err) {
                            resolve(module.buildPlayAction(
                                module.config.not_found_message));
                        } else {
                            resolve(module.buildPlayAction(
                                module.config.sucessfull_message));
                        }
                    });
                }
            });
        });
    }


    /**
     *
     * @param {*} list
     * @param {*} callback
     */
    openVideo(list, callback) {
        let module = this;

        if (list && list.length > 0) {
            cmd.get(
                OPEN_VIDEO_COMMAND + ' ' +
                    YOUTUBE_BASE_VIDEO_URL + list[0] + '?autoplay=1 &',
                function(err, data, stderr) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                }
            );
        } else {
            setTimeout(function() {
                return module.buildPlayAction(module.config.not_found_message);
            }, 2000);
        }
    }


    /**
     * Finds music on youtube matching query
     *
     * @param {*} query
     * @param {*} callback
     */
    findYouTube(query, callback) {
        let url = GOGGLE_YOUTUBE_API + query + '&key=' +
            this.config.youtube_key + '&maxResults=1';

        request.get({
            url: url,
        },
            function(err, httpResponse, body) {
                if (err) {
                    setTimeout(function() {
                        callback([], err);
                    }, 2000);
                } else {
                    callback(buildResponse(JSON.parse(body)));
                }
            });
    }
};

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
                urlList.push(item.id.videoId);
            }
        }
    }

    return urlList;
}

/**
 * Returns an instance of this class
 *
 * @param{*} moduleName
 * @return {*} instance
 */
function getInstance(moduleName) {
    if (!instance) {
        instance = new VideoModule(moduleName);
    }
    return instance;
}


module.exports = {getInstance};
