'use strict';

const fs = require('fs');
const cacheConfig = require('./config').getConfig();

const Logger = require('../logger');
const logger = new Logger('CACHE');

const FILE_TYPE = 'FILE';
const STRING_TYPE = 'STRING';

/**
 * Caches files and json responses.
 *
 */
class Cache {
    /**
     * Constructor
     *
     * @param {*} serviceName
     */
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.serviceConfig = cacheConfig.jarvis.services.cache;
        this.config = this.getConfig();
    }

    /**
     * Puts a FILE into the cache
     *
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
            _cache.putCacheValue(key, FILE_TYPE, cacheFileName);
        });
    }

    /**
     * Puts a STRING value into the cache
     *
     * @param {*} key
     * @param {*} value
     */
    putStringCacheValue(key, value) {
        this.putCacheValue(key, STRING_TYPE, value);
    }

    /**
     * Puts a value into the cache
     *
     * @param {*} key
     * @param {*} type
     * @param {*} value
     */
    putCacheValue(key, type, value) {
        if (!this.serviceConfig.enabled) {
            return;
        }

        logger.log('Adding to cache. [key = ' + key + ', type = ' + type
            + ', value = ' + value + ']');

        this.config.entries.push({key: key,
            type: type,
            value: value,
            service: this.serviceName,
            date: new Date().getTime()});

        this.saveConfig();
    }

    /**
     * Retrieves a value from the cache
     *
     * @param {*} key
     * @return {*} value
     */
    getCacheValue(key) {
        if (!this.serviceConfig.enabled) {
            return undefined;
        }

        for (const entry of this.config.entries) {
            if (entry.key == key && entry.service == this.serviceName) {
                logger.log('Found in cache [value = ' + entry.value + ']');
                return entry.value;
            }
        }
    }

    /**
     * Saves the config file
     *
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

        let newConfig = {
            'entries': [
            ],
        };

        for (const entry of this.config.entries) {
            let ttl = this.serviceConfig.ttl * 3600 * 1000;

            if (now - entry.date >= ttl) {
                logger.log('Expiring entry [ value = ' + entry.value + ' ]');

                if (FILE_TYPE == entry.type) {
                    fs.unlinkSync(entry.value);
                }
            } else {
                newConfig.entries.push(entry);
            }
        }

        this.config = newConfig;
    }

    /**
     * Load the config from the file
     *
     * @return {*} json
     */
    getConfig() {
        logger.log('Loading cache config [ file = ' +
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
