import {rewriteURL} from '../util';

const devRules = [
    {"reg": "^[^/?]+$", "replace": "https://mydb.cheminfo.org/db/visualizer/entry/$&/view.json"},
    {"reg": "^[^/]+\/view.json$", "replace": "https://mydb.cheminfo.org/db/visualizer/entry/$&"}
];

const prodRules = [
    {"reg": "^([^/?]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
    {"reg": "^[^/]+$", "replace": "https://couch.cheminfo.org/cheminfo-public/$&/view.json"},
    {"reg": "^[^/]+\/view.json.*", "replace": "https://couch.cheminfo.org/cheminfo-public/$&"}
];

describe('dev rewrite rules', function () {
    const rules = devRules;
    it('should rewrite uuid', function () {
        expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03')).toEqual('https://mydb.cheminfo.org/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json');
    });

    it('should not rewrite uuid with rev', function () {
        expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae')).toEqual(null);
    });

    it('should rewrite uuid/view.json', function () {
        expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03/view.json')).toEqual('https://mydb.cheminfo.org/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json');
    });

    it('should not rewrite uuid/view.json with rev', function () {
        expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae')).toEqual(null);
    });

    it('should not rewrite full url', function () {
        expect(rewriteURL(rules, 'https://mydb.cheminfo.org')).toEqual(null);
    });
});

describe('prod rewrite rules', function () {
   const rules = prodRules;
   it('should rewrite uuid', function () {
       expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03')).toEqual('https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json');
   });

   it('should rewrite uuid with rev and referer', function () {
       expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae')).toEqual('https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae');
   });

   it('should rewrite uuid/view.json with rev and referer', function () {
       expect(rewriteURL(rules, '15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae')).toEqual('https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae');
   });

    it('should not rewrite full url', function () {
        expect(rewriteURL(rules, 'https://mydb.cheminfo.org')).toEqual(null);
    });
});

