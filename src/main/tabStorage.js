import lockr from 'lockr';

import { version } from './constants.js';

const LOCAL_STORAGE_TAB_DATA = 'vweb-';
const LOCAL_STORAGE_TAB_IDS = 'vweb1-tab-ids';
const LOCAL_STORAGE_LAST_TAB = 'vweb1-selected-tab';

const storage = {};

function isVersionOK(v) {
  return v === undefined || v === version;
}

export function save(tabId, data) {
  if (!tabId) return;
  lockr.sadd(LOCAL_STORAGE_TAB_IDS, tabId);
  let key = LOCAL_STORAGE_TAB_DATA + tabId;
  data.version = version;
  lockr.set(key, data);
}

export function saveSelected(tabId) {
  if (!tabId) return;
  lockr.set(LOCAL_STORAGE_LAST_TAB, tabId);
}

export function getSelected() {
  return lockr.get(LOCAL_STORAGE_LAST_TAB);
}

export function load() {
  let ids = lockr.smembers(LOCAL_STORAGE_TAB_IDS);
  if (!ids) return [];

  let data = ids.map((id) => {
    return lockr.get(LOCAL_STORAGE_TAB_DATA + id);
  });

  data.forEach((entry) => {
    if (!isVersionOK(entry.version)) {
      storage.remove(entry.id);
    }
  });

  data = data.filter((entry) => isVersionOK(entry.version));

  data.sort(function sortData(a, b) {
    let idxA = ids.indexOf(a.id);
    let idxB = ids.indexOf(b.id);
    if (idxA < idxB) return -1;
    else if (idxB < idxA) return 1;
    else return 0;
  });
  return data;
}

export function remove(id) {
  lockr.srem(LOCAL_STORAGE_TAB_IDS, id);
  lockr.rm(LOCAL_STORAGE_TAB_DATA + id);
}

export default storage;
