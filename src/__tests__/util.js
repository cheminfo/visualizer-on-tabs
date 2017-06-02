import {rewriteURL} from '../util';

const devRules = [
    {"reg": "^([a-z0-9]+)\\?.*", "replace": "https://mydb.cheminfo.org/db/visualizer/entry/$1/view.json"},
    {"reg": "^([a-z0-9]+)\/view.json\\?.*", "replace": "https://mydb.cheminfo.org/db/visualizer/entry/$1/view.json"},
    {"reg": "^[a-z0-9]+\/view.json$", "replace": "https://mydb.cheminfo.org/db/visualizer/entry/$&"},
    {"reg": "^[a-z0-9]+$", "replace": "https://mydb.cheminfo.org/db/visualizer/entry/$&/view.json"}
];

const prodRules = [
    {"reg": "^([a-z0-9]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
    {"reg": "^[a-z0-9]+$", "replace": "https://couch.cheminfo.org/cheminfo-public/$&/view.json"},
    {"reg": "^[a-z0-9]+\/view.json\\?.*", "replace": "https://couch.cheminfo.org/cheminfo-public/$&"}
];

const dockerDevRules = [
    {"reg": "^public/([a-z0-9]+)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json"},
    {"reg": "^public/([a-z0-9]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
    {"reg": "^private/([a-z0-9]+)$", "replace": "../roc/db/visualizer/entry/$1/view.json"},
    [
        {"reg": "^private/([a-z0-9]+)\\?(.*)$", "replace": "../roc/db/visualizer/entry/$1/view.json?$2"},
        {"reg": "rev=[a-z0-9\\-]+", "replace": ""},
        {"reg": "&&", "replace": "&", "optionalMatch": true},
        {"reg": "\\?&", "replace": "?", "optionalMatch": true},
        {"reg": "\\?$", "replace": "", "optionalMatch": true},
        {"reg": "\\&$", "replace": "", "optionalMatch": true},

    ],
    {"reg": "^[a-z0-9]+$", "replace": "https://couch.cheminfo.org/cheminfo-public/$&/view.json"},
    {"reg": "^([a-z0-9]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
    {"reg": "^[^/]+\/view.json.*", "replace": "https://couch.cheminfo.org/cheminfo-public/$&"}
];

const dockerProdRules = [
    {"reg": "^public/([a-z0-9]+)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json"},
    {"reg": "^public/([a-z0-9]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
    {"reg": "^private/([a-z0-9]+)$", "replace": "../roc/db/visualizer/entry/$1/view.json"},
    {"reg": "^private/([a-z0-9]+)\\?(.*)$", "replace": "../roc/db/visualizer/entry/$1/view.json?$2"},
    {"reg": "../couch/visualizer/(.*)", "replace": "../roc/db/visualizer/entry/$1"},
    {"reg": "^[a-z0-9]+$", "replace": "https://couch.cheminfo.org/cheminfo-public/$&/view.json"},
    {"reg": "^([a-z0-9]+)\\?(.*)$", "replace": "https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2"},
    {"reg": "^[^/]+\/view.json.*", "replace": "https://couch.cheminfo.org/cheminfo-public/$&"}
];

describe('dev rewrite rules', function () {
    const assertRewrite = testRewrite(devRules);
    assertRewrite(
        'should rewrite uuid',
        '15c9a2dcd55c963fdedf2c18a1471b03',
        'https://mydb.cheminfo.org/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite uuid with rev by ignoring rev',
        '15c9a2dcd55c963fdedf2c18a1471b03?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://mydb.cheminfo.org/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite uuid/view.json',
        '15c9a2dcd55c963fdedf2c18a1471b03/view.json',
        'https://mydb.cheminfo.org/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite uuid/view.json by ignoring rev',
        '15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://mydb.cheminfo.org/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should not rewrite full url',
        'https://mydb.cheminfo.org',
        null
    );
});

describe('prod rewrite rules', function () {
   const rules = prodRules;
   const assertRewrite = testRewrite(rules);

    assertRewrite(
        'should rewrite uuid',
        '15c9a2dcd55c963fdedf2c18a1471b03',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite uuid with rev and referer',
        '15c9a2dcd55c963fdedf2c18a1471b03?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );
    assertRewrite(
        'should rewrite uuid/view.json with rev and referer',
        '15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abc&rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );
    assertRewrite(
        'should not rewrite full url',
        'https://mydb.cheminfo.org',
        null
    );
});

describe('docker prod rewrite rules', function () {
    const assertRewrite = testRewrite(dockerProdRules);
    assertRewrite(
        'should rewrite explicit public uuid',
        'public/15c9a2dcd55c963fdedf2c18a1471b03',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite explicit public uuid with query string',
        'public/15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );

    assertRewrite(
        'should rewrite explicit private uuid',
        'private/15c9a2dcd55c963fdedf2c18a1471b03',
        '../roc/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite explicit private uuid with the query string',
        'private/15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae',
        '../roc/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json?rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );

    assertRewrite(
        'should rewrite from couch to roc',
        '../couch/visualizer/15c9a2dcd55c963fdedf2c18a1471b03/view.json',
        '../roc/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should implicitely rewrite uuid to public url',
        '15c9a2dcd55c963fdedf2c18a1471b03',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should implicitely rewrite uuid with query string to public url',
        '15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );

    assertRewrite(
        'should implicitely rewrite uuid/view.json to public url',
        '15c9a2dcd55c963fdedf2c18a1471b03/view.json',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should implicitely rewrite uuid/view.json with query string to public url',
        '15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );

    assertRewrite(
        'should not rewrite full url',
        'https://mydb.cheminfo.org',
        null
    );
});

describe('docker dev rewrite rules', function () {
    const assertRewrite = testRewrite(dockerDevRules);
    assertRewrite(
        'should rewrite explicit public uuid',
        'public/15c9a2dcd55c963fdedf2c18a1471b03',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite explicit public uuid with query string',
        'public/15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );

    assertRewrite(
        'should rewrite explicit private uuid',
        'private/15c9a2dcd55c963fdedf2c18a1471b03',
        '../roc/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite explicit private uuid without the revision',
        'private/15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae',
        '../roc/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should rewrite explicit private uuid without the revision but with the referer (1)',
        'private/15c9a2dcd55c963fdedf2c18a1471b03?referer=abcd.com&rev=161-13da947c771e6847466bc8f0cd43f9ae',
        '../roc/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abcd.com'
    );

    assertRewrite(
        'should rewrite explicit private uuid without the revision but with the referer (2)',
        'private/15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae&referer=abcd.com',
        '../roc/db/visualizer/entry/15c9a2dcd55c963fdedf2c18a1471b03/view.json?referer=abcd.com'
    );

    assertRewrite(
        'should implicitely rewrite uuid to public url',
        '15c9a2dcd55c963fdedf2c18a1471b03',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should implicitely rewrite uuid with query string to public url',
        '15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );

    assertRewrite(
        'should implicitely rewrite uuid/view.json to public url',
        '15c9a2dcd55c963fdedf2c18a1471b03/view.json',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json'
    );

    assertRewrite(
        'should implicitely rewrite uuid/view.json with query string to public url',
        '15c9a2dcd55c963fdedf2c18a1471b03?rev=161-13da947c771e6847466bc8f0cd43f9ae',
        'https://couch.cheminfo.org/cheminfo-public/15c9a2dcd55c963fdedf2c18a1471b03/view.json?rev=161-13da947c771e6847466bc8f0cd43f9ae'
    );

    assertRewrite(
        'should not rewrite full url',
        'https://mydb.cheminfo.org',
        null
    );
});

function testRewrite(rules) {
    return function(description, input, output) {
        it(description, function () {
            expect(rewriteURL(rules, input)).toEqual(output);
        });
    }
}