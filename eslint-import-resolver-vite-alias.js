/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

const fs = require('fs');
const { builtinModules } = require('module');
const path = require('path');

const projectRoot = __dirname;
const sourceRoot = path.join(projectRoot, 'src');
const extensions = ['', '.js', '.vue', '.json', '.scss', '.css', '.svg'];
const aliases = {
  '@': sourceRoot,
  'docc-render': sourceRoot,
  theme: sourceRoot,
  'highlight-js-alias': path.join(projectRoot, 'node_modules/highlight.js'),
};
const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map(module => `node:${module}`),
]);

function resolveFile(candidate) {
  const candidates = [
    ...extensions.map(extension => `${candidate}${extension}`),
    ...extensions.slice(1).map(extension => path.join(candidate, `index${extension}`)),
  ];
  return candidates.find((file) => {
    try {
      return fs.statSync(file).isFile();
    } catch {
      return false;
    }
  });
}

function resolveAlias(source) {
  const alias = Object.keys(aliases).find(
    candidate => source === candidate || source.startsWith(`${candidate}/`),
  );
  if (!alias) return null;
  return resolveFile(path.join(aliases[alias], source.slice(alias.length)));
}

module.exports = {
  interfaceVersion: 2,
  resolve(source, importer) {
    if (builtins.has(source) || source.startsWith('virtual:')) {
      return { found: true, path: null };
    }

    const aliasPath = resolveAlias(source);
    if (aliasPath) return { found: true, path: aliasPath };

    if (source.startsWith('.')) {
      const relativePath = resolveFile(path.resolve(path.dirname(importer), source));
      return relativePath
        ? { found: true, path: relativePath }
        : { found: false };
    }

    try {
      return {
        found: true,
        path: require.resolve(source, {
          paths: [path.dirname(importer), projectRoot],
        }),
      };
    } catch {
      return { found: false };
    }
  },
};
