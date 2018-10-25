#!/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const argv = require('minimist')(process.argv.slice(2));

const build = require('..');

const options = {};
if (argv.watch) options.watch = argv.watch;
if (argv.outDir) options.outDir = argv.outDir;
if (argv.debug) options.debug = argv.debug;

if (argv.config) {
  const configFile = path.resolve(path.join(__dirname, '..'), argv.config);
  options.config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'), {
    filename: configFile
  });
}

build(options)
  .then(function() {
    console.log('Build succeeded');
  })
  .catch(function(e) {
    console.log(e.message, e.stack);
    console.error('Build failed');
  });
