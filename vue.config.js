/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

const path = require('path');
const vueUtils = require('./src/setup-utils/vue-config-utils');

module.exports = vueUtils({
  pages: {
    index: {
      entry: 'app/main.js',
      template: 'app/index.html',
    },
  },
  chainWebpack(config) {
    config
      .plugin('copy')
      .use('copy-webpack-plugin', [[{
        from: path.resolve(__dirname, 'app/public'),
        to: path.resolve(__dirname, 'dist'),
        toType: 'dir',
        ignore: ['.DS_Store'],
      }]]);
  },
});
