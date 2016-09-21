'use strict';

import {EventEmitter} from 'events';

let Tabs = new EventEmitter();

Tabs.openTab = function (data) {
    Tabs.emit('openTab', data);
};

Tabs.status = function(data) {
    Tabs.emit('status', data);
};

Tabs.sendMessage = function (message) {
    Tabs.emit('message', message);
};

export default Tabs;