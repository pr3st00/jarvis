'use strict';

const fs = require('fs');
const cacheConfig = require('./config').getConfig();

const Logger = require('../logger');
const logger = new Logger('CACHE');

/**
 * Caches files and json responses.
 */
class Cache {
    /**
     * Constructor
     * @param {*} serviceName
     */
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.serviceConfig = cacheConfig.jarvis.services.cache;
        this.config = this.getConfig();
    }

    /**
     * Puts a file into the cache
     * @param {*} key
     * @param {*} fileName
     */
    putFileCacheValue(key, fileName) {
        if (!this.serviceConfig.enabled) {
            return;
        }

        let cacheFileName = this.serviceConfig.cacheDir + '/' + 'cache_'
         + new Date().getTime();

        let _cache = this;

        fs.copyFile(fileName, cacheFileName, function() {
            _cache.putCacheValue(key, cacheFileName);
        });
    }

    /**
     * Puts a value into the cache
     * @param {*} key
     * @param {*} value
     */
    putCacheValue(key, value) {
        if (!this.serviceConfig.enabled) {
            return;
        }

        logger.log('Adding to cache. [key =' + key + ', value=' + value + ']');
        this.config.entries.push({key: key,
            value: value,
            service: this.serviceName,
            date: new Date().getTime()});
        this.saveConfig();
    }

    /**
     * Retrieves a value from the cache
     * @param {*} key
     * @return {*} value
     */
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

    /**
     * Saves the config file
     */
    saveConfig() {
        if (!this.serviceConfig.enabled) {
            return;
        }

        this.expireValues();

        fs.writeFile(this.serviceConfig.cacheConfig,
            JSON.stringify(this.config),
            function() {
                logger.log('Cache saved.');
        });
    }

    /**
     * Expires old values from the cache
     */
    expireValues() {
        let now = new Date().getTime();

        for (const entry of this.config.entries) {
            if (now - entry.date >=
                (this.serviceConfig.ttl * 3600 * 24 * 1000)) {
                logger.log('Expiring entry [ value=' + entry.value + ' ]');
                this.config.entries.splice(i, 1);
            }
        }
    }

    /**
     * Load the config from the file
     * @return {*} json
     */
    getConfig() {
        logger.log('Loading cache config [ file=' +
            this.serviceConfig.cacheConfig + ' ]');

        try {
            return JSON.parse(fs.readFileSync(
                this.serviceConfig.cacheConfig, 'utf8'));
        } catch (err) {
            return this.config = {
                'entries': [
                ],
            };
        }
    }
}

module.exports = Cache;
