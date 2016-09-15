'use strict';

import Tabs from '../main/Tabs';

export default function iframeMessageHandler(data, [level2]) {
    var prom;
    switch (level2) {
        case 'open':
            Tabs.openTab(data.message);
            prom = Promise.resolve('done');
            break;
        case 'status':
            Tabs.status(data);
            prom = Promise.resolve('done');
            break;
        default:
            prom = Promise.reject(`Unknown action: ${level2}}`);
            break;
    }

    prom.then(message => {
        data.message = message.data;
        this.postMessage(data);
    }, error => {
        data.status = 'error';
        data.message = error;
        this.postMessage(data);
    });
}

function wrapAsMessage(data) {
    return {
        data: data
    }
}
