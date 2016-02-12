'use strict';
const webpack = require('webpack');
const path = require('path');
const fs = require('fs-promise');
const WebpackOnBuildPlugin = require('on-build-webpack');


module.exports = function (options) {
    const outDir = path.resolve(__dirname, '../out');
    options = options || {};

    var conf = options.config || {};
    var confPath = path.join(__dirname, '../src/config.json');
    return fs.writeFile(confPath, JSON.stringify(conf))
        .then(function () {
        return Promise.all([buildApp(), copyContent()]);
    })
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

    function printErrors(errors) {
        errors.forEach(function (error) {
            console.error(error);
        });
    }
};

