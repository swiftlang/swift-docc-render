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

/**
 * Resolve a path to the current dir
 * @param {...string} args - extra parameters to pass to path.resolve
 * @return {string}
 */
const resolveToAppDir = (...args) => path.resolve(process.cwd(), ...args);

function getThemePaths() {
  // order the theme fallback from custom theme, to official, to third party
  return [
    // custom theme path
    resolveToAppDir('src/theme'),
    // path to `swift-docc-render/src`
    path.resolve(__dirname, '../'),
  ].filter(Boolean);
}

module.exports = { getThemePaths };
