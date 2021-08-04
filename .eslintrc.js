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
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? [
      'error',
      { allow: ['error', 'warn'] },
    ] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    indent: [
      'error', 2,
      { ignoredNodes: ['TemplateLiteral'] },
    ],
    'arrow-parens': ['error', 'as-needed', {
      requireForBlockBody: true,
    }],
    'template-curly-spacing': 'off',
    'vue/experimental-script-setup-vars': 'off',
  },
  overrides: [
    {
      files: ['*Icon.vue'],
      rules: {
        'max-len': 'off',
      },
    },
    {
      files: ['**/__mocks__/*.js'],
      env: {
        jest: true,
      },
    },
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
