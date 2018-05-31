'use strict';

const request = require('request');
const URL = 'https://pt.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro&exsentences=1&titles=';

/**
 *
 */
class Wikipedia {
    /**
     *
     * @param {*} query
     */
    constructor(query) {
        this.query = query;
    }

    /**
     *
     */
    describe() {
        let text = this.query.trim();
        let textToSearch;


        let regex = /\s+/;
        let matches = text.split(regex);

        if (matches) {
            let originalText = matches[matches.length - 1];
            textToSearch = originalText.replace(/[^A-Z]/ig, '');
        }

        let url = URL + textToSearch;

    }
}

module.exports = Wikipedia;
