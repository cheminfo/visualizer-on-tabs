'use strict';

const config = '../config.json';

export function getConfig() {
    return config.visualizerConfig || defaultConfig;
}


let defaultConfig = {

};

