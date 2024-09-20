/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { restoreScrollOnReload, saveScrollOnReload, scrollBehavior } from 'docc-render/utils/router-utils';
import Router from 'vue-router';
import SwiftDocCRenderRouter from 'docc-render/setup-utils/SwiftDocCRenderRouter';
import FetchError from 'docc-render/errors/FetchError';

jest.mock('docc-render/utils/theme-settings', () => ({
  baseUrl: '/',
  getSetting: jest.fn(),
}));

const mockInstance = {
  onError: jest.fn(),
  onReady: jest.fn(),
  replace: jest.fn(),
  beforeEach: jest.fn(),
  afterEach: jest.fn(),
};

jest.mock('vue-router', () => jest.fn(() => (mockInstance)));
jest.mock('docc-render/utils/router-utils', () => ({
  restoreScrollOnReload: jest.fn(),
  scrollBehavior: jest.fn(),
  saveScrollOnReload: jest.fn(),
}));

describe('SwiftDocCRenderRouter', () => {
  beforeEach(() => {
    window.removeEventListener('unload', saveScrollOnReload);
    jest.clearAllMocks();
  });

  it('creates a new VueRouter instance and attaches the correct hooks', () => {
    const routerInstance = SwiftDocCRenderRouter();
    expect(routerInstance).toEqual(mockInstance);
    expect(mockInstance.onReady).toHaveBeenCalledTimes(1);
  });

  it('restores scroll position `onReady`', () => {
    const routerInstance = SwiftDocCRenderRouter();
    window.history.scrollRestoration = 'auto';
    expect(restoreScrollOnReload).toHaveBeenCalledTimes(0);
    routerInstance.onReady.mock.calls[0][0].call();
    expect(restoreScrollOnReload).toHaveBeenCalledTimes(1);
    expect(window.history.scrollRestoration).toBe('manual');
  });

  it('replaces the current route with "server-error" for errors', () => {
    const routeWithError = { name: 'fake-path', path: '/fake/path' };
    const routerInstance = SwiftDocCRenderRouter();

    routerInstance.onError.mock.calls[0][0].call({}, new FetchError(routeWithError));
    expect(routerInstance.replace).toHaveBeenCalledWith({
      name: 'server-error',
      params: [routeWithError.path],
    });

    routerInstance.onError.mock.calls[0][0].call({}, new Error('?'));
    expect(routerInstance.replace).toHaveBeenCalledWith({
      name: 'server-error',
      params: ['/'],
    });
  });

  it('does not have an error handler for IDE targets', () => {
    process.env.VUE_APP_TARGET = 'ide';
    expect(SwiftDocCRenderRouter().onError.mock.calls.length).toBe(0);
  });

  it('calls instantiated Vue Router with a default set of settings', () => {
    SwiftDocCRenderRouter();
    expect(Router).toHaveBeenCalledWith({
      base: '/',
      mode: 'history',
      routes: expect.any(Array),
      scrollBehavior,
    });
  });

  it('accepts provided config file', () => {
    SwiftDocCRenderRouter({
      routes: ['a'],
      foo: 'foo',
    });
    expect(Router).toHaveBeenCalledWith({
      base: '/',
      mode: 'history',
      routes: ['a'],
      scrollBehavior,
      // assert the provided config is passed
      foo: 'foo',
    });
  });

  it('stores the last scroll coordinates on `unload`', () => {
    SwiftDocCRenderRouter();

    window.dispatchEvent(new Event('unload'));
    expect(saveScrollOnReload).toHaveBeenCalledTimes(1);
  });

  describe('route resolving', () => {
    let router;

    beforeAll(() => {
      jest.resetModules();
      jest.unmock('vue-router');
      // eslint-disable-next-line global-require
      router = require('docc-render/setup-utils/SwiftDocCRenderRouter').default();
    });

    const resolve = path => router.resolve(path).route;

    it('resolves paths to the "tutorials-overview-locale" route', () => {
      const route = 'tutorials-overview-locale';

      expect(resolve('/tutorials/foo').name).toBe(route);
      expect(resolve('/tutorials/bar').name).toBe(route);

      expect(resolve('/tutorials/foo/bar').name).not.toBe(route);

      expect(resolve('/tutorials/documentation').name).toBe(route);
    });

    it('resolves paths to the "tutorials-overview-locale" route', () => {
      const route = 'tutorials-overview-locale';

      expect(resolve('/en-US/tutorials/foobar').name).toBe(route);
      expect(resolve('/ja-JP/tutorials/foobarbaz').params).toEqual({
        id: 'foobarbaz',
        locale: 'ja-JP',
      });
      expect(resolve('/zh-CN/tutorials/foo/bar').name).not.toBe(route);
    });

    it('resolves paths to the "topic-locale" route', () => {
      const route = 'topic-locale';
      expect(resolve('/tutorials/foo/bar').name).toBe(route);
      expect(resolve('/tutorials/foobar/baz').name).toBe(route);
      expect(resolve('/tutorials/documentation/foo').name).toBe(route);
    });

    it('resolves paths to the "topic-locale" route', () => {
      const route = 'topic-locale';

      expect(resolve('/en-US/tutorials/foo/bar').name).toBe(route);
      expect(resolve('/ja-JP/tutorials/foo/bar').params).toEqual({
        id: 'foo',
        locale: 'ja-JP',
        pathMatch: 'bar',
      });
      expect(resolve('/zh-CN/tutorials/foo/bar/baz').params).toEqual({
        id: 'foo',
        locale: 'zh-CN',
        pathMatch: 'bar/baz',
      });
    });

    it('resolves paths to the "documentation-topic-locale" route', () => {
      const route = 'documentation-topic-locale';

      expect(resolve('/documentation/foo').name).toBe(route);
      expect(resolve('/documentation/bar').name).toBe(route);
      expect(resolve('/documentation/foobar').params.pathMatch).toBe('/foobar');

      expect(resolve('/documentation/tutorials').name).toBe(route);
      expect(resolve('/documentation/tutorials').params.pathMatch).toBe('/tutorials');
    });

    it('resolves paths to the "documentation-topic-locale" route', () => {
      const route = 'documentation-topic-locale';

      expect(resolve('/en-US/documentation/foo').name).toBe(route);
      expect(resolve('/en-US/documentation/foo').params).toEqual({
        locale: 'en-US',
        pathMatch: '/foo',
      });
      expect(resolve('/ja-JP/documentation/bar').name).toBe(route);
      expect(resolve('/ja-JP/documentation/bar').params).toEqual({
        locale: 'ja-JP',
        pathMatch: '/bar',
      });
      expect(resolve('/zh-CN/documentation/baz').name).toBe(route);
      expect(resolve('/zh-CN/documentation/baz/qux').params).toEqual({
        locale: 'zh-CN',
        pathMatch: '/baz/qux',
      });
    });
  });
});
