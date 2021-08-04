/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// eslint-disable-next-line import/no-extraneous-dependencies
const { BannerPlugin } = require('webpack');

const LICENSE_HEADER = `This source file is part of the Swift.org open source project

Copyright (c) 2021 Apple Inc. and the Swift project authors
Licensed under Apache License v2.0 with Runtime Library Exception

See https://swift.org/LICENSE.txt for license information
See https://swift.org/CONTRIBUTORS.txt for Swift project authors`;

const wrapCommentHTML = str => `<!--\n  ${str
  .replace(/\*\//g, '* /')
  .split('\n')
  .join('\n  ')
  .replace(/\s+\n/g, '\n\n')
  .trimRight()}\n-->\n\n`;

/**
 * Adds license header to HTML built files
 * @param {string} - license header
 */
class HTMLBannerPlugin {
  constructor(licenseHeader) {
    this.licenseHeader = wrapCommentHTML(licenseHeader);
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('HTMLBannerPlugin', (compilation) => {
      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(
        'HTMLBannerPlugin',
        (data) => {
          const HTMLData = data;
          HTMLData.html = this.licenseHeader + HTMLData.html;
          return HTMLData;
        },
      );
    });
  }
}

module.exports = { BannerPlugin, HTMLBannerPlugin, LICENSE_HEADER };
