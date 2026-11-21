/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginVitest from '@vitest/eslint-plugin';
import pluginOxlint from 'eslint-plugin-oxlint';
import pluginAccessibility from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    '**/coverage/**',
    '**/dist/**',
    '**/dist-ssr/**',
    '**/docs/**',
    '**/node_modules/**',
    '**/tmp/**',
  ]),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...pluginAccessibility.configs['flat/recommended'],

  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? [
        'error',
        { allow: ['error', 'warn'] },
      ] : 'off',
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
    name: 'app/test-mocks',
    files: ['**/__mocks__/*.js'],
    languageOptions: {
      globals: globals.vitest,
    },
  },
  {
    ...pluginVitest.configs.recommended,
    files: ['tests/unit/**/*.spec.js'],
    languageOptions: {
      globals: globals.vitest,
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      'vitest/expect-expect': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/valid-expect': 'off',
      'vitest/valid-title': 'off',
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
]);
