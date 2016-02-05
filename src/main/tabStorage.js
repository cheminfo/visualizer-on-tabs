'use strict';

import lockr from 'lockr';

const LOCAL_STORAGE_TAB_DATA = 'vweb-';
const LOCAL_STORAGE_TAB_IDS = 'vweb1-tab-ids';

let storage = {};

storage.save = function (tabId, data) {
    if (!tabId) return;
    lockr.sadd(LOCAL_STORAGE_TAB_IDS, tabId);
    var key = LOCAL_STORAGE_TAB_DATA + tabId;
    lockr.set(key, data);
};

storage.load = function () {
    var ids = lockr.smembers(LOCAL_STORAGE_TAB_IDS);
    if (!ids) return;

    var data = lockr.getAll().filter(val => {
        if (!val || !val.id) return false;
        return ids.indexOf(val.id) !== -1
    });

    data.sort(function (a, b) {
        var idxA = ids.indexOf(a.id);
        var idxB = ids.indexOf(b.id);
        if (idxA < idxB) return -1;
        else if (idxB < idxA) return 1;
        else return 0;
    });
    return data;
};

storage.remove = function (id) {
    lockr.srem(LOCAL_STORAGE_TAB_IDS, id);
    lockr.rm(LOCAL_STORAGE_TAB_DATA + id);
};

export default storage;
