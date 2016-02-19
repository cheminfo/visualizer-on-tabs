#!/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');

const argv = require('minimist')(process.argv.slice(2));

var build = require('..');

var options = {};
options.watch = argv.watch;
options.outDir = argv.outDir;

if(argv.config) {
    options.config = JSON.parse(fs.readFileSync(path.resolve(path.join(__dirname, '..'), argv.config), 'utf-8'));
}

build(options).then(function () {
    console.log('Build succeeded');
}).catch(function () {
    console.error('Build failed');
});

