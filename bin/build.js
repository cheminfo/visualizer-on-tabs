#!/bin/env node

'use strict';

var build = require('..');

var options = {};
options.watch = (process.argv[2] === '--watch');

build(options).then(function () {
    console.log('Build succeeded');
}).catch(function () {
    console.error('Build failed');
});

