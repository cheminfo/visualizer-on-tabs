import { EventEmitter } from 'events';

const Tabs = new EventEmitter();

Tabs.openTab = function openTab(data) {
  Tabs.emit('openTab', data);
};

Tabs.status = function status(data) {
  Tabs.emit('status', data);
};

Tabs.sendMessage = function sendMessage(message) {
  Tabs.emit('message', message);
};

Tabs.focus = function focus(message) {
  Tabs.emit('focus', message);
};

export default Tabs;
