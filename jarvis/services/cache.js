'use strict'

var fs = require('fs');

const CACHE_DIR = "/tmp/jarviscache";
const CACHE_CONFIG = CACHE_DIR + "/cache.json";

var config = getConfig();
var Logger = require('../logger');
var logger = new Logger("CACHE");


function putFileCacheValue(key, fileName) {
    var cacheFileName = CACHE_DIR + "/" + "cache_" + new Date().getTime();

    fs.copyFile(fileName, cacheFileName, function () {
        putCacheValue(key, cacheFileName);
    });
}

function putCacheValue(key, value) {
    logger.log('Adding to cache. [key =' + key + ', value=' + value + ']');
    config.entries.push({ key: key, value: value });
    saveConfig();
}

function getCacheValue(key) {

    for (var i in config.entries) {
        if (config.entries[i].key == key) {
            return config.entries[i].value;
        }
    }

    return undefined;
}

function saveConfig() {
    fs.writeFile(CACHE_CONFIG, JSON.stringify(config), function () {
        logger.log('Cache saved.')
    });
}

function getConfig() {
    try {
        return JSON.parse(fs.readFileSync(CACHE_CONFIG, 'utf8'));
    } catch (err) {
        return config = {
            "entries": [
            ]
        };
    }
}

module.exports = { getCacheValue, putCacheValue, putFileCacheValue };