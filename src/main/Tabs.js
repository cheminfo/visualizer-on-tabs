'use strict';

import {EventEmitter} from 'events';

let Tabs = new EventEmitter();

Tabs.openTab = function (data) {
    Tabs.emit('openTab', data);
};

export default Tabs;