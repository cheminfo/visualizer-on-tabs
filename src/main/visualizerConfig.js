'use strict';

const config = '../config.json';

export function getConfig() {
    return config.visualizerConfig || defaultConfig;
}


let defaultConfig = {
    debugLevel: 0,
    filters: [],
    modules: {
        folders: ['modules/types']
    },
    header: false
};

