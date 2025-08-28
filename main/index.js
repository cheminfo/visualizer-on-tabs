import path from 'node:path';
import { fileURLToPath } from 'url';

import fs from 'fs-extra';
import _ from 'lodash';
import { makeVisualizerPage } from 'react-visualizer';
import webpack from 'webpack';

import iframeBridge from './iframe-bridge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultOptions = {
  outDir: 'out',
};

const defaultConfig = {
  title: 'visualizer-on-tabs',
};

const buildApp = (options, outDir) => {
  const entries = [{ file: 'app.js' }];
  const prom = [];
  for (const entry of entries) {
    let resolve;
    let reject;
    let p = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    prom.push(p);
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
              presets: [
                [
                  '@babel/env',
                  {
                    targets: {
                      browsers: ['chrome >= 54', 'firefox >= 45'],
                    },
                  },
                ],
                '@babel/react',
              ],
            },
          },
        ],
      },
      watch: options.watch,
    };

    webpack(config, function handleError(err) {
      if (err) {
        reject(err);
      } else {
        // TODO: use node's util.debuglog here and in flavor-builder
        // eslint-disable-next-line no-console
        console.log(`Build of ${entry.file} successful`);
        resolve();
      }
    });
  }

  return Promise.all(prom);
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
  const page = makeVisualizerPage({
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

  const confPath = path.join(__dirname, '../src/config/custom.json');
  await fs.writeFile(confPath, JSON.stringify(options.config));
  await Promise.all([buildApp(options, outDir), copyContent(outDir)]);
  await addIndex(outDir, options);
  await addVisualizer(outDir, options);
  return fs.unlink(confPath);
};
