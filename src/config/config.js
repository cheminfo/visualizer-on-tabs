'use strict';

const defaultConfig = require('./default');
const customConfig = getCustomConfig();

function getCustomConfig() {
    try {
        return require('./custom.json');
    } catch(e) {
        return {};
    }
}

var config = Object.assign({}, defaultConfig, customConfig);
if(config.login && config.login.url) {
    // Remove trailing slash
    config.login.url = config.login.url.replace(/\/$/, '');
}
module.exports = config;