

import {rewriteURL} from '../util';

test('Test rewriteURL dev', function() {

    const rules=[
        {"reg": "^([^/]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
        {"reg": "^[^/]+$", "replace": "https://mydb.cheminfo.org/db/visualizer/entry/$&/view.json"},
        {"reg": "^[^/]+\/view.json.*", "replace": "https://couch.cheminfo.org/cheminfo-public/$&"}
    ];

    expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03')).toEqual('https://mydb.cheminfo.org/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json');
    expect(rewriteURL(rules, '02235fb1ae3f9ed6437526bacfe21a98?referer=abc&rev=80-622311b3fc278ba244b6e058d8d0804f')).toEqual('https://couch.cheminfo.org/cheminfo-public/02235fb1ae3f9ed6437526bacfe21a98/view.json?referer=abc&rev=80-622311b3fc278ba244b6e058d8d0804f');
    expect(rewriteURL(rules, '02235fb1ae3f9ed6437526bacfe21a98/view.json?referer=abc&rev=80-622311b3fc278ba244b6e058d8d0804f')).toEqual('https://couch.cheminfo.org/cheminfo-public/02235fb1ae3f9ed6437526bacfe21a98/view.json?referer=abc&rev=80-622311b3fc278ba244b6e058d8d0804f');
});

test('Test rewriteURL prod', function () {
   const rules = [
       {"reg": "^([^/]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
       {"reg": "^[^/]+$", "replace": "https://couch.cheminfo.org/cheminfo-public/$&/view.json"},
       {"reg": "^[^/]+\/view.json.*", "replace": "https://couch.cheminfo.org/cheminfo-public/$&"}
   ];

    expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03')).toEqual('https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json');
    expect(rewriteURL(rules, '02235fb1ae3f9ed6437526bacfe21a98?referer=abc&rev=80-622311b3fc278ba244b6e058d8d0804f')).toEqual('https://couch.cheminfo.org/cheminfo-public/02235fb1ae3f9ed6437526bacfe21a98/view.json?referer=abc&rev=80-622311b3fc278ba244b6e058d8d0804f');
    expect(rewriteURL(rules, '02235fb1ae3f9ed6437526bacfe21a98/view.json?referer=abc&rev=80-622311b3fc278ba244b6e058d8d0804f')).toEqual('https://couch.cheminfo.org/cheminfo-public/02235fb1ae3f9ed6437526bacfe21a98/view.json?referer=abc&rev=80-622311b3fc278ba244b6e058d8d0804f');

});