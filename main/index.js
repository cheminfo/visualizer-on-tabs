/* eslint-disable no-console */

import path from 'node:path';
import { fileURLToPath } from 'url';

import fs from 'fs-extra';
import _ from 'lodash';
import visualizer from 'react-visualizer';
import webpack from 'webpack';

import iframeBridge from './iframe-bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultOptions = {
  outDir: 'out',
};

const defaultConfig = {
  title: 'visualizer-on-tabs',
};

const buildApp = (options, outDir, cleanup) => {
  const entries = [{ file: 'app.js' }];
  for (const entry of entries) {
    let config = {
      mode: options.debug ? 'development' : 'production',
      entry: path.join(__dirname, '../src', entry.file),
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
  return fs.copy(path.join(__dirname, '../src/content'), outDir);
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
  options = { ...defaultOptions, ...options };
  options.config = { ...defaultConfig, ...options.config };

  const outDir = path.resolve(__dirname, '..', options.outDir);
  await fs.ensureDir(outDir);

  const confPath = path.join(__dirname, '../src/config/custom.json');
  console.log('Copying files');
  await Promise.all([
    fs.writeFile(confPath, JSON.stringify(options.config)),
    copyContent(outDir),
    addIndex(outDir, options),
    addVisualizer(outDir, options),
  ]);

  async function cleanup() {
    if (fs.pathExistsSync(confPath)) {
      console.log('Cleaning up');
      await fs.unlink(confPath);
    } else {
      console.log('Nothing to clean up');
    }
  }

  console.log('Building app');
  void buildApp(options, outDir, cleanup);

  return cleanup;
};
