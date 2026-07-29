/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    resolve: {
      alias: [
        {
          find: /^@vue\/test-utils$/,
          replacement: fileURLToPath(
            new URL('./tests/unit/vue-test-utils-compat.js', import.meta.url),
          ),
        },
        {
          find: /^theme\/.*\.(gif|jpe?g|png|svg|webp)$/,
          replacement: fileURLToPath(new URL('./tests/unit/file-mock.js', import.meta.url)),
        },
        {
          find: /\.(gif|jpe?g|png|svg|webp)$/,
          replacement: fileURLToPath(new URL('./tests/unit/file-mock.js', import.meta.url)),
        },
        {
          find: 'virtual:swift-docc-highlight-languages',
          replacement: fileURLToPath(
            new URL('./tests/unit/highlight-language-loaders.js', import.meta.url),
          ),
        },
        {
          find: 'vue-virtual-scroller',
          replacement: fileURLToPath(
            new URL('./tests/unit/vue-virtual-scroller.js', import.meta.url),
          ),
        },
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
      exclude: [...configDefaults.exclude],
      globals: true,
      include: ['tests/unit/**/*.spec.js'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      sequence: {
        hooks: 'list',
      },
      setupFiles: ['./tests/unit/config.js'],
      snapshotFormat: {
        escapeString: false,
        printBasicPrototype: false,
      },
    },
  }),
));
