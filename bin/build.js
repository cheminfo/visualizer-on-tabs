#!/usr/bin/env node

/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';

import build from '../main/index.js';

const { values: argv } = parseArgs({
  options: {
    outDir: { type: 'string', short: 'o' },
    dev: { type: 'boolean', short: 'D' },
    config: { type: 'string', short: 'c' },
  },
});

if (!argv.outDir) {
  console.log(`CLI args:
    --outDir - output directory (required)
    --dev - development mode with file watching
    --config - path to JSON config file
  `);
  throw new Error('The --outDir option is required.');
}

const mode = argv.dev ? 'development' : 'production';
const watch = !!argv.dev;
const outDir = argv.outDir;
let config = {};
if (argv.config) {
  const configFile = path.resolve(argv.config);
  config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

const cleanup = await build({ mode, watch, outDir, config });

process.on('SIGINT', async () => {
  console.log('Build cancelled on SIGINT');
  cleanup().catch(console.error);
  process.exit(1);
});
