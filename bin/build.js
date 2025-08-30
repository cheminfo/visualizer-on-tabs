#!/bin/env node

/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import yaml from 'js-yaml';
import minimist from 'minimist';

import build from '../main/index.js';

const argv = minimist(process.argv.slice(2));

const options = {};
if (argv.watch) options.watch = argv.watch;
if (argv.outDir) options.outDir = argv.outDir;
if (argv.debug) options.debug = argv.debug;

if (argv.config) {
  const configFile = path.resolve(
    path.join(import.meta.dirname, '..'),
    argv.config,
  );
  options.config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'), {
    filename: configFile,
  });
}

const cleanup = await build(options);

process.on('SIGINT', async () => {
  console.log('Build cancelled on SIGINT');
  cleanup().catch(console.error);
  process.exit(1);
});
