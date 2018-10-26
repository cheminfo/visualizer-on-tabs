import { EventEmitter } from 'events';

const Tabs = new EventEmitter();

Tabs.openTab = function (data) {
  Tabs.emit('openTab', data);
};

Tabs.status = function (data) {
  Tabs.emit('status', data);
};

Tabs.sendMessage = function (message) {
  Tabs.emit('message', message);
};

Tabs.focus = function (message) {
  Tabs.emit('focus', message);
};

export default Tabs;
