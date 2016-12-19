'use strict';
const webpack = require('webpack');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-promise');
const WebpackOnBuildPlugin = require('on-build-webpack');

const defaultOptions = {
    title: 'visualizer-on-tabs',
    outDir: 'out',
    config: {}
};

module.exports = function (options) {
    options = Object.assign({}, defaultOptions, options);
    const outDir = path.resolve(__dirname, '..', options.outDir);

    const confPath = path.join(__dirname, '../src/config/custom.json');
    return fs.writeFile(confPath, JSON.stringify(options.config))
        .then(function () {
        return Promise.all([buildApp(), copyContent()]);
    })
        .then(() => addIndex(options))
        .then(function () {
            return fs.unlink(confPath);
        });


    function buildApp () {
        const entries = [
            {file: 'app.js'}
        ];

        let prom = [];
        for (let entry of entries) {
            var _res;
            var p = new Promise(function(resolve, reject) {
                _res = resolve;
            });
            prom.push(p);
            let config = {
                entry: path.join(__dirname, '../src', entry.file),
                output: {
                    path: outDir,
                    filename: entry.file
                },
                module: {
                    loaders: [
                        {
                            test: /\.js$/,
                            include: [
                                path.resolve(__dirname, '../src'),
                                path.resolve(__dirname, '../node_modules/iframe-bridge')
                            ],
                            loader: 'babel',
                            query: {
                                presets: ['es2015', 'react']
                            }
                        },
                        {
                            test: /\.json$/,
                            include: [path.resolve(__dirname, '../src')],
                            loader: 'json'
                        }
                    ]
                },
                plugins: [
                    new WebpackOnBuildPlugin(function(stats) {
                        console.log('webpack build done');
                        _res();
                    })
                ],
                watch: options.watch
            };

            if(!options.debug) {
                config.plugins.unshift(new webpack.DefinePlugin({
                    'process.env.NODE_ENV': '"production"'
                }));
            }

            webpack(config, function (err, stats) {
                var jsonStats = stats.toJson();
                if (err) {
                    throw err;
                } else if (jsonStats.errors.length > 0) {
                    printErrors(jsonStats.errors);
                    if (!options.watch) {
                        throw Error('Could not build ' + entry.file);
                    }
                } else if (jsonStats.warnings.length > 0) {
                    printErrors(jsonStats.warnings);
                } else {
                    console.log('Build of ' + entry.file + ' successful');
                }
            });
        }

        return Promise.all(prom);
    }

    function copyContent() {
        return fs.copy(path.join(__dirname, '../src/content'), outDir);
    }

    function addIndex() {
        return fs.readFile(path.join(__dirname, '../src/template/index.html'), 'utf8')
            .then(function (content) {
                const tpl = _.template(content);
                return fs.writeFile(path.join(outDir, 'index.html'), tpl({
                    title: options.title,
                    uniqid: Date.now()
                }));
            });
    }

    function printErrors(errors) {
        errors.forEach(function (error) {
            console.error(error);
        });
    }
};

