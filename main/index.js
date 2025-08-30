/* eslint-disable no-console */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';

import _ from 'lodash';
import visualizer from 'react-visualizer';
import webpack from 'webpack';

import iframeBridge from './iframe-bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultConfig = {
  title: 'visualizer-on-tabs',
};

const buildApp = (options, outDir, cleanup) => {
  const entries = [{ file: 'app.js' }];
  for (const entry of entries) {
    let config = {
      mode: options.debug ? 'development' : 'production',
      context: path.resolve(__dirname, '../'),
      entry: path.resolve(__dirname, '../src', entry.file),
      output: {
        path: outDir,
        filename: entry.file,
      },
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            include: [
              path.resolve(__dirname, '../src'),
              path.resolve(__dirname, '../node_modules/iframe-bridge'),
            ],
            loader: 'babel-loader',
            options: {
              cwd: path.join(__dirname, '..'),
              presets: ['@babel/env', '@babel/react'],
            },
          },
        ],
      },
    };

    function handleError(err, stats) {
      if (err) {
        if (options.watch) {
          console.error(err.stack, err.message);
        } else {
          throw err;
        }
      } else {
        // TODO: use node's util.debuglog here and in flavor-builder
        const statsJson = stats.toJson();

        if (statsJson.errors.length > 0) {
          for (let error of statsJson.errors) {
            console.error(error.message);
          }
          if (!options.watch) {
            throw new Error(
              `Build failed with ${statsJson.errors.length} error(s)`,
            );
          }
        }
        if (statsJson.warnings.length > 0) {
          for (let warning of statsJson.warnings) {
            console.warn(warning.message);
          }
        }
        console.log(`Build of ${entry.file} successful`);
        if (!options.watch) {
          cleanup().catch(console.error);
        }
      }
    }
    const instance = webpack(config);
    if (options.watch) {
      instance.watch({ aggregateTimeout: 200 }, handleError);
    } else {
      instance.run(handleError);
    }
  }
};

const copyContent = (outDir) => {
  return fs.cp(path.join(__dirname, '../src/content'), outDir, {
    recursive: true,
  });
};

const addIndex = async (outDir, options) => {
  const content = await fs.readFile(
    path.join(__dirname, '../src/template/index.html'),
    'utf8',
  );
  const tpl = _.template(content);
  return fs.writeFile(
    path.join(outDir, 'index.html'),
    tpl({
      title: options.config.title,
      uniqid: Date.now(),
    }),
  );
};

const addVisualizer = async (outDir, options) => {
  const page = visualizer.makeVisualizerPage({
    cdn: options.visualizerCDN,
    fallbackVersion: options.visualizerFallbackVersion,
    scripts: [
      {
        url: iframeBridge,
      },
    ],
  });
  return fs.writeFile(path.join(outDir, 'visualizer.html'), page);
};

export default async (options) => {
  options.config = { ...defaultConfig, ...options.config };

  const outDir = path.resolve(options.outDir);
  await fs.mkdir(outDir, { recursive: true });

  const confPath = path.join(__dirname, '../src/config/custom.json');
  console.log('Copying files');
  await Promise.all([
    fs.writeFile(confPath, JSON.stringify(options.config)),
    copyContent(outDir),
    addIndex(outDir, options),
    addVisualizer(outDir, options),
  ]);

  async function cleanup() {
    console.log('Cleaning up');
    // Normally, the file should exist when this is called.
    await fs.unlink(confPath);
  }

  console.log('Building app');
  void buildApp(options, outDir, cleanup);

  return cleanup;
};
