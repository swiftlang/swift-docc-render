/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(projectRoot, 'src');
const testRoot = path.join(projectRoot, 'tests/unit');

export default defineConfig({
  root: projectRoot,
  plugins: [
    vue({
      template: {
        compilerOptions: {
          whitespace: 'preserve',
          isCustomElement: tag => tag.startsWith('custom-'),
        },
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^@vue\/test-utils$/,
        replacement: path.join(testRoot, 'vue-test-utils-compat.js'),
      },
      {
        find: /^theme\/.*\.(gif|jpe?g|png|svg|webp)$/,
        replacement: path.join(testRoot, 'file-mock.js'),
      },
      {
        find: /\.(gif|jpe?g|png|svg|webp)$/,
        replacement: path.join(testRoot, 'file-mock.js'),
      },
      {
        find: 'virtual:swift-docc-highlight-languages',
        replacement: path.join(testRoot, 'highlight-language-loaders.js'),
      },
      {
        find: 'vue-virtual-scroller',
        replacement: path.join(testRoot, 'vue-virtual-scroller.js'),
      },
      {
        find: 'highlight-js-alias',
        replacement: path.join(projectRoot, 'node_modules/highlight.js'),
      },
      { find: '@', replacement: sourceRoot },
      { find: 'docc-render', replacement: sourceRoot },
      { find: 'theme', replacement: sourceRoot },
    ],
  },
  test: {
    css: false,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    fileParallelism: false,
    globals: true,
    include: ['tests/unit/**/*.spec.js'],
    maxWorkers: 1,
    sequence: {
      hooks: 'list',
    },
    setupFiles: ['./tests/unit/config.js'],
    snapshotFormat: {
      escapeString: false,
      printBasicPrototype: false,
    },
  },
});
