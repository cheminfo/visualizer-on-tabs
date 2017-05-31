

import {rewriteURL} from '../util';

test('Test rewriteURL', function() {

    const config=[
        {"reg": "^[^/]+$", "replace": "https://mydb.cheminfo.org/db/visualizer/entry/$&/view.json"},
        {"reg": "^([^/]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
        {"reg": "^[^/]+\/[^/]+$", "replace": "https://couch.cheminfo.org/$&/view.json"},
        {"reg": "^[^/]+\/view.json.*", "replace": "https://couch.cheminfo.org/cheminfo-public/$&"},
        {"reg": "^[^/]+\/[^/]+\/view.json.*", "replace": "https://couch.cheminfo.org/$&"}
    ];

    expect(rewriteURL(config, 'abc/view.json')).toEqual('xx');


});