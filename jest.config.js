/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  // support the same docc-render/ & theme/ -> src alias mapping in source code
  moduleNameMapper: {
    '^docc-render/(.*)$': '<rootDir>/src/$1',
    '^theme/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};
