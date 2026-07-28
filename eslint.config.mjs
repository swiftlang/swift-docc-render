/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
 */

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import imports from 'eslint-plugin-import-x';
import vue from 'eslint-plugin-vue';
import accessibility from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
    ],
  },
  eslint.configs.recommended,
  ...vue.configs['flat/essential'],
  ...accessibility.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,vue}'],
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      import: imports,
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? [
        'error',
        { allow: ['error', 'warn'] },
      ] : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-irregular-whitespace': ['error', {
        skipStrings: true,
        skipComments: true,
      }],
      '@stylistic/arrow-parens': ['error', 'as-needed', {
        requireForBlockBody: true,
      }],
      '@stylistic/template-curly-spacing': 'off',
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/function-call-argument-newline': 'off',
      'no-unused-vars': ['error', {
        args: 'after-used',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        vars: 'all',
      }],
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/require-toggle-inside-transition': 'off',
      'vuejs-accessibility/form-control-has-label': 'off',
      'vuejs-accessibility/label-has-for': 'off',
      'vuejs-accessibility/aria-role': 'off',
      'vuejs-accessibility/click-events-have-key-events': 'off',
      'vuejs-accessibility/anchor-has-content': 'off',
      'vuejs-accessibility/no-static-element-interactions': 'off',
    },
  },
  {
    files: ['**/__mocks__/*.js', '**/tests/unit/**/*.spec.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
  {
    files: ['vite.config.mjs'],
    rules: {
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: true,
      }],
    },
  },
];
