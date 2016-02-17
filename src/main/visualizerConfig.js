'use strict';
export function getConfig() {
    return userConfig;
}

let userConfig = {
    debugLevel: 0,
    filters: [],
    modules: {
        folders: ['modules/types']
    },
    header: false
};

