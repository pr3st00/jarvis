'use strict'

var fs = require('fs');
var cacheConfig = require('./config').getConfig();

var Logger = require('../logger');
var logger = new Logger("CACHE");

/**
 * Caches files and json responses.
 * 
 */
class Cache {

    constructor(serviceName) {
        this.serviceName = serviceName;
        this.serviceConfig = cacheConfig.jarvis.services.cache;
        this.config = this.getConfig();
    }

    putFileCacheValue(key, fileName) {
        if (!this.serviceConfig.enabled) {
            return undefined;
        }

        var cacheFileName = this.serviceConfig.cacheDir + "/" + "cache_" + new Date().getTime();
        var _cache = this;

        fs.copyFile(fileName, cacheFileName, function () {
            _cache.putCacheValue(key, cacheFileName);
        });
    }

    putCacheValue(key, value) {
        if (!this.serviceConfig.enabled) {
            return undefined;
        }

        logger.log('Adding to cache. [key =' + key + ', value=' + value + ']');
        this.config.entries.push({ key: key, value: value, service: this.serviceName, date: new Date().getTime() });
        this.saveConfig();
    }

    getCacheValue(key) {
        if (!this.serviceConfig.enabled) {
            return undefined;
        }

        for (const entry of this.config.entries) {
            if (entry.key == key && entry.service == this.serviceName) {
                logger.log('Found in cache [value=' + entry.value + ']');
                return entry.value;
            }
        }
    }

    saveConfig() {
        if (!this.serviceConfig.enabled) {
            return undefined;
        }

        this.expireValues();

        fs.writeFile(this.serviceConfig.cacheConfig, JSON.stringify(this.config), function () {
            logger.log('Cache saved.')
        });
    }

    expireValues() {
        var now = new Date().getTime();

        for (const entry of this.config.entries) {
            if (now - entry.date >= (this.serviceConfig.ttl * 3600 * 24 * 1000)) {
                logger.log("Expiring entry [ value=" + entry.value + " ]");
                this.config.entries.splice(i, 1);
            }
        }
    }

    getConfig() {
        logger.log('Loading cache config [ file=' + this.serviceConfig.cacheConfig + ' ]');

        try {
            return JSON.parse(fs.readFileSync(this.serviceConfig.cacheConfig, 'utf8'));
        } catch (err) {
            return this.config = {
                "entries": [
                ]
            };
        }

    }
}

module.exports = Cache;