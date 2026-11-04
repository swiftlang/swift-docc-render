/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { mergeConfig } from 'vite';
import swiftDocCRender, {
  BASE_URL_PLACEHOLDER,
  localDocCArchive,
  themeFallback,
} from '../../vite';

const sourceRoot = path.resolve(import.meta.dirname, '../../src');

describe('shared Vite plugins', () => {
  it('provides the base configuration for consuming applications', () => {
    const plugins = swiftDocCRender({
      defaultLocale: 'en-US',
      performanceEnabled: 'true',
      target: 'ide',
      title: 'Custom Documentation',
    });
    const baseConfig = plugins.find(({ name }) => name === 'swift-docc-render-base-config')
      .config({}, { command: 'build' });
    const indexPlugin = plugins.find(({ name }) => name === 'swift-docc-render-index-template');
    indexPlugin.configResolved({ command: 'build' });

    expect(baseConfig.base).toBe(`/${BASE_URL_PLACEHOLDER}/`);
    expect(baseConfig.resolve.alias['docc-render']).toBe(sourceRoot);
    expect(baseConfig.resolve.dedupe).toEqual(['vue', 'vue-router', 'vue-i18n']);
    expect(baseConfig.optimizeDeps).toEqual({
      exclude: ['swift-docc-render', 'docc-render'],
      include: [
        'swift-docc-render > css.escape',
        'swift-docc-render > highlight.js/lib/core',
        'swift-docc-render > @apple/highlightjs-pkl',
      ],
    });
    expect(baseConfig.define).toEqual({
      'process.env.VUE_APP_DEFAULT_LOCALE': JSON.stringify('en-US'),
      'process.env.VUE_APP_PERFORMANCE_ENABLED': JSON.stringify('true'),
      'process.env.VUE_APP_TARGET': JSON.stringify('ide'),
      'process.env.VUE_APP_TITLE': JSON.stringify('Custom Documentation'),
    });
    expect(baseConfig.css.preprocessorOptions.scss.additionalData).toContain("$build-target: 'ide'");
    expect(indexPlugin.transformIndexHtml.handler('__SWIFT_DOCC_RENDER_TITLE__'))
      .toBe('Custom Documentation');
  });

  it('preserves consuming application configuration', () => {
    const renderBuiltUrl = vi.fn();
    const userConfig = {
      base: '/custom/',
      build: {
        rolldownOptions: {
          output: {
            assetFileNames: 'custom-assets/[name][extname]',
            chunkFileNames: 'custom-chunks/[name].js',
            entryFileNames: 'custom-entry/[name].js',
          },
        },
        sourcemap: true,
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ['mixed-decls'],
          },
        },
      },
      define: {
        'process.env.VUE_APP_TITLE': JSON.stringify('Consumer Documentation'),
      },
      experimental: { renderBuiltUrl },
      resolve: {
        alias: {
          'docc-render': '/custom/docc-render',
        },
        dedupe: ['vue'],
      },
    };
    const basePlugin = swiftDocCRender({ scssAdditionalData: '$custom: true;' })
      .find(({ name }) => name === 'swift-docc-render-base-config');
    const config = mergeConfig(userConfig, basePlugin.config(userConfig, { command: 'build' }));

    expect(config.base).toBe('/custom/');
    expect(config.build.sourcemap).toBe(true);
    expect(config.build.rolldownOptions.output).toEqual(userConfig.build.rolldownOptions.output);
    expect(config.css.preprocessorOptions.scss.additionalData).toContain('$custom: true;');
    expect(config.css.preprocessorOptions.scss.silenceDeprecations).toEqual(['mixed-decls']);
    expect(config.define['process.env.VUE_APP_TITLE'])
      .toBe(JSON.stringify('Consumer Documentation'));
    expect(config.experimental.renderBuiltUrl).toBe(renderBuiltUrl);
    expect(config.resolve.alias['docc-render']).toBe('/custom/docc-render');
    expect(config.resolve.dedupe).toEqual(['vue', 'vue-router', 'vue-i18n']);
  });
});

describe('theme fallback', () => {
  let themeRoot;

  beforeEach(() => {
    themeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'swift-docc-render-theme-'));
  });

  afterEach(() => {
    fs.rmSync(themeRoot, { force: true, recursive: true });
  });

  it('uses the consuming application theme directory by default', () => {
    const component = path.join(themeRoot, 'src', 'theme', 'components', 'Custom.vue');
    fs.mkdirSync(path.dirname(component), { recursive: true });
    fs.writeFileSync(component, '<template />');
    const plugin = themeFallback();
    plugin.configResolved({ root: themeRoot });

    expect(plugin.resolveId('theme/components/Custom.vue')).toBe(component);
  });

  it('prefers files from a consuming application theme', () => {
    const component = path.join(themeRoot, '$theme', 'components', 'Custom.vue');
    fs.mkdirSync(path.dirname(component), { recursive: true });
    fs.writeFileSync(component, '<template />');
    const plugin = themeFallback({ themeRoots: [path.join(themeRoot, '$theme')] });
    plugin.configResolved({ root: '/consumer' });
    const pluginConfig = plugin.config();
    const overrideAlias = pluginConfig.resolve.alias
      .find(({ find }) => (
        find instanceof RegExp
        && find.test('theme/components/Custom.vue')
        && !find.test('theme/components/Custom.vue/child')
      ));
    const fallbackAlias = pluginConfig.resolve.alias
      .find(({ find }) => find.source === '^theme\\/(.*)$');

    expect(plugin.resolveId('theme/components/Custom.vue')).toBe(component);
    expect(overrideAlias.replacement).toBe(component.replaceAll('$', '$$$$'));
    expect(fallbackAlias.find.test('theme/components/Icons/CloseIcon.vue')).toBe(true);
  });

  it('falls back to swift-docc-render source files', () => {
    const plugin = themeFallback({ themeRoots: [themeRoot] });
    plugin.configResolved({ root: '/consumer' });

    expect(plugin.resolveId('theme/components/Icons/CloseIcon.vue'))
      .toBe(path.join(sourceRoot, 'components/Icons/CloseIcon.vue'));
  });
});

describe('local DocC archive middleware', () => {
  it('returns a 404 for missing archive resources', () => {
    let middleware;
    localDocCArchive('/missing/archive').configureServer({
      middlewares: {
        use: vi.fn((handler) => {
          middleware = handler;
        }),
      },
    });
    const response = { end: vi.fn() };
    const next = vi.fn();

    middleware({ url: '/data/documentation/missing.json' }, response, next);

    expect(response.statusCode).toBe(404);
    expect(response.end).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });
});
