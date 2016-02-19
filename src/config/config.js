'use strict';

const defaultConfig = require('./default');
const customConfig = getCustomConfig();

function getCustomConfig() {
    try {
        var custom = require('./custom.json');
        return custom;
    } catch(e) {
        return {};
    }
}

module.exports = Object.assign({}, defaultConfig, customConfig);