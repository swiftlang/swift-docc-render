/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

module.exports = {
  globals: {
    'vue-jest': {
      compilerOptions: {
        whitespace: 'preserve',
        compatConfig: {
          MODE: 2,
        },
      },
    },
  },
  moduleFileExtensions: ['js', 'json', 'vue'],
  testMatch: ['**/tests/unit/**/*.spec.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue3-jest',
  },
  // support the same docc-render/ & theme/ -> src alias mapping in source code
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@vue/test-utils$': '<rootDir>/tests/unit/vue-test-utils-compat.js',
    '^theme/.*\\.(gif|jpe?g|png|svg|webp)$': '<rootDir>/tests/unit/file-mock.js',
    '^docc-render/(.*)$': '<rootDir>/src/$1',
    '^theme/(.*)$': '<rootDir>/src/$1',
    '^highlight-js-alias/(.*)$': '<rootDir>/node_modules/highlight.js/$1',
    '^virtual:swift-docc-highlight-languages$': '<rootDir>/tests/unit/highlight-language-loaders.js',
    '^vue-virtual-scroller$': '<rootDir>/tests/unit/vue-virtual-scroller.js',
    '^vue$': '@vue/compat',
    '\\.(gif|jpe?g|png|svg|webp)$': '<rootDir>/tests/unit/file-mock.js',
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['./tests/unit/config.js'],
  snapshotSerializers: ['jest-serializer-vue'],
  snapshotFormat: {
    escapeString: false,
    printBasicPrototype: false,
  },
  transformIgnorePatterns: [
    '/node_modules/(?!\\.pnpm/@apple\\+highlightjs-pkl@|@apple/highlightjs-pkl)',
  ],
};
