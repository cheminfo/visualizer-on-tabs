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
if(config.rocLogin && config.rocLogin.url) {
    // Remove trailing slash
    config.rocLogin.url = config.rocLogin.url.replace(/\/$/, '');
}
module.exports = config;