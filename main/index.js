/* eslint-disable no-console */

import fs from 'node:fs/promises';
import path from 'node:path';

import _ from 'lodash';
import visualizer from 'react-visualizer';
import webpack from 'webpack';

import iframeBridge from './iframe-bridge.js';

const __dirname = import.meta.dirname;

const defaultConfig = {
  title: 'visualizer-on-tabs',
};

async function buildApp(options, outDir, cleanup) {
  const { promise, resolve, reject } = Promise.withResolvers();
  const entries = [{ file: 'app.js' }];
  for (const entry of entries) {
    let config = {
      mode: options.mode === 'development' ? 'development' : 'production',
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
          reject(err);
        }
      } else {
        // TODO: use node's util.debuglog here and in flavor-builder
        const statsJson = stats.toJson();

        if (statsJson.errors.length > 0) {
          for (let error of statsJson.errors) {
            console.error(error.message);
          }
          if (!options.watch) {
            reject(
              new Error(
                `Build failed with ${statsJson.errors.length} error(s)`,
              ),
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
          cleanup()
            .catch(console.error)
            .then(() => resolve(cleanup));
        }
      }
    }
    const instance = webpack(config);
    if (options.watch) {
      instance.watch({ aggregateTimeout: 200 }, handleError);
      // In watch mode we resolve before the first build is done.
      resolve(cleanup);
    } else {
      // With a single run, the handler will resolve / reject the promise.
      instance.run(handleError);
    }
  }
  return promise;
}

export default async (options) => {
  Object.assign(options.config, defaultConfig);

  const outDir = path.resolve(options.outDir);
  await fs.mkdir(outDir, { recursive: true });

  const confPath = path.join(__dirname, '../src/config/custom.json');
  console.log('Copying files');
  await Promise.all([
    fs.writeFile(confPath, JSON.stringify(options.config)),
    copyContent(options),
    addIndex(options),
    addVisualizer(options),
  ]);

  async function cleanup() {
    console.log('Cleaning up');
    // Normally, the file should exist when this is called.
    await fs.unlink(confPath);
  }

  console.log('Building app');
  await buildApp(options, outDir, cleanup);

  return cleanup;
};

function copyContent(options) {
  return fs.cp(path.join(__dirname, '../src/content'), options.outDir, {
    recursive: true,
  });
}

async function addIndex(options) {
  const content = await fs.readFile(
    path.join(__dirname, '../src/template/index.html'),
    'utf8',
  );
  const tpl = _.template(content);
  return fs.writeFile(
    path.join(options.outDir, 'index.html'),
    tpl({
      title: options.config.title,
      uniqid: Date.now(),
    }),
  );
}

function addVisualizer(options) {
  const page = visualizer.makeVisualizerPage({
    cdn: options.config.visualizerCDN,
    fallbackVersion: options.config.visualizerFallbackVersion,
    scripts: [
      {
        url: iframeBridge,
      },
    ],
  });
  return fs.writeFile(path.join(options.outDir, 'visualizer.html'), page);
}
