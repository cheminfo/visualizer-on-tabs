'use strict';

import lockr from 'lockr';
import { version } from './constants';

const LOCAL_STORAGE_TAB_DATA = 'vweb-';
const LOCAL_STORAGE_TAB_IDS = 'vweb1-tab-ids';
const LOCAL_STORAGE_LAST_TAB = 'vweb1-selected-tab';

let storage = {};

function isVersionOK(v) {
  return v === undefined || v === version;
}

storage.save = function(tabId, data) {
  if (!tabId) return;
  lockr.sadd(LOCAL_STORAGE_TAB_IDS, tabId);
  var key = LOCAL_STORAGE_TAB_DATA + tabId;
  data.version = version;
  lockr.set(key, data);
};

storage.saveSelected = function(tabId) {
  if (!tabId) return;
  lockr.set(LOCAL_STORAGE_LAST_TAB, tabId);
};

storage.getSelected = function() {
  return lockr.get(LOCAL_STORAGE_LAST_TAB);
};

storage.load = function() {
  var ids = lockr.smembers(LOCAL_STORAGE_TAB_IDS);
  if (!ids) return [];

  var data = ids.map(id => {
    return lockr.get(LOCAL_STORAGE_TAB_DATA + id);
  });

  data.forEach(entry => {
    if (!isVersionOK(entry.version)) {
      storage.remove(entry.id);
    }
  });

  data = data.filter(entry => isVersionOK(entry.version));

  data.sort(function(a, b) {
    var idxA = ids.indexOf(a.id);
    var idxB = ids.indexOf(b.id);
    if (idxA < idxB) return -1;
    else if (idxB < idxA) return 1;
    else return 0;
  });
  return data;
};

storage.remove = function(id) {
  lockr.srem(LOCAL_STORAGE_TAB_IDS, id);
  lockr.rm(LOCAL_STORAGE_TAB_DATA + id);
};

export default storage;
