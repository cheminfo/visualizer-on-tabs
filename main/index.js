'use strict';

/* eslint-disable no-console */

const path = require('path');

const webpack = require('webpack');
const _ = require('lodash');
const fs = require('fs-extra');

const defaultOptions = {
  outDir: 'out'
};

const defaultConfig = {
  title: 'visualizer-on-tabs'
};

module.exports = async function (options) {
  options = Object.assign({}, defaultOptions, options);
  options.config = Object.assign({}, defaultConfig, options.config);

  const outDir = path.resolve(__dirname, '..', options.outDir);

  const confPath = path.join(__dirname, '../src/config/custom.json');
  await fs.writeFile(confPath, JSON.stringify(options.config));
  await Promise.all([buildApp(), copyContent()]);
  await addIndex(options);
  return fs.unlink(confPath);

  function buildApp() {
    const entries = [{ file: 'app.js' }];

    const prom = [];
    for (const entry of entries) {
      let config = {
        mode: options.debug ? 'development' : 'production',
        entry: path.join(__dirname, '../src', entry.file),
        output: {
          path: outDir,
          filename: entry.file
        },
        devtool: 'source-map',
        module: {
          rules: [
            {
              test: /\.js$/,
              include: [
                path.resolve(__dirname, '../src'),
                path.resolve(__dirname, '../node_modules/iframe-bridge')
              ],
              loader: 'babel-loader',
              options: {
                cwd: path.join(__dirname, '..'),
                presets: [
                  [
                    '@babel/env',
                    {
                      targets: {
                        browsers: [
                          'chrome >= 54', // Last version supported on windows 7
                          'firefox >= 45',
                        ]
                      }
                    }
                  ],
                  '@babel/react'
                ]
              }
            }
          ]
        },
        watch: options.watch
      };

      webpack(config, function (err) {
        if (err) {
          throw err;
        } else {
          console.log(`Build of ${entry.file} successful`);
        }
      });
    }

    return Promise.all(prom);
  }

  function copyContent() {
    return fs.copy(path.join(__dirname, '../src/content'), outDir);
  }

  async function addIndex() {
    const content = await fs.readFile(
      path.join(__dirname, '../src/template/index.html'),
      'utf8'
    );
    const tpl = _.template(content);
    return fs.writeFile(
      path.join(outDir, 'index.html'),
      tpl({
        title: options.config.title,
        uniqid: Date.now()
      })
    );
  }
};


