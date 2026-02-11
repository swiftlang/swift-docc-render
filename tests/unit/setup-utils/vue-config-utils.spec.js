/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import vueConfigUtils from 'docc-render/setup-utils/vue-config-utils';

describe('vue-config-utils', () => {
  beforeEach(() => {
    delete process.env.VUE_APP_TITLE;
    delete process.env.VUE_APP_DEV_SERVER_PROXY;
  });
  describe('Page Title', () => {
    it('does not set a page variable if already provided', () => {
      process.env.VUE_APP_TITLE = 'Foo';
      vueConfigUtils();
      expect(process.env.VUE_APP_TITLE).toBe('Foo');
    });

    it('does not set a page title if it is set to empty value', () => {
      process.env.VUE_APP_TITLE = '';
      vueConfigUtils();
      expect(process.env.VUE_APP_TITLE).toBe('');
    });

    it('sets the default page title if none provided', () => {
      vueConfigUtils();
      expect(process.env.VUE_APP_TITLE).toBe('Documentation');
    });
  });

  describe('options', () => {
    it('generates VueCLI options', () => {
      expect(vueConfigUtils())
        .toEqual({
          chainWebpack: expect.any(Function),
          css: {
            extract: false,
            loaderOptions: {
              scss: {
                additionalData: "$build-target: 'default'; $is-target-ide: $build-target == 'ide';",
              },
            },
          },
          devServer: { proxy: { '^/(data|downloads|images|videos|index|theme-settings.json)': { target: 'http://localhost:8000' } } },
          productionSourceMap: false,
          transpileDependencies: ['swift-docc-render'],
        });
    });
    it('generates VueCLI options, under production mode', () => {
      process.env.NODE_ENV = 'production';
      expect(vueConfigUtils())
        .toEqual({
          chainWebpack: expect.any(Function),
          css: {
            extract: {
              ignoreOrder: true,
            },
            loaderOptions: {
              scss: {
                additionalData: "$build-target: 'default'; $is-target-ide: $build-target == 'ide';",
              },
            },
          },
          devServer: { proxy: { '^/(data|downloads|images|videos|index|theme-settings.json)': { target: 'http://localhost:8000' } } },
          productionSourceMap: false,
          transpileDependencies: ['swift-docc-render'],
        });
    });
  });
});
