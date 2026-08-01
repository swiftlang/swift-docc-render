/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  baseNavHeight,
  baseNavHeightSmallBreakpoint,
} from 'docc-render/constants/nav';
import { documentationTopicName } from 'docc-render/constants/router';
import {
  scrollBehavior as originalScrollBehavior,
  getCurrentLocation,
  restoreScrollOnReload,
  saveScrollOnReload,
} from 'docc-render/utils/router-utils';
import { EXTRA_DOCUMENTATION_OFFSET } from '@/utils/scroll-offset';

const appTarget = process.env.VUE_APP_TARGET;

const sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
const scrollToSpy = vi.fn();
const mockLocation = vi.fn().mockReturnValue({
  pathname: '/foo',
  search: '?bar',
  hash: '#baz',
});
Object.defineProperty(window, 'scrollTo', {
  value: scrollToSpy,
});
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorage,
});
Object.defineProperty(window, 'location', {
  get: mockLocation,
});

describe('router-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scrollBehavior', () => {
    const mockApp = { app: { $nextTick: vi.fn().mockResolvedValue({}) } };
    const scrollBehavior = originalScrollBehavior.bind(mockApp);

    const createRoute = (name, query, hash, meta) => ({
      name, query, hash, meta,
    });
    const routeFoo = createRoute('foo', {}, 'foo');
    const routeBar = createRoute('bar', {}, 'bar');

    beforeEach(() => {
      process.env.VUE_APP_TARGET = appTarget;
    });

    it('resolves with the saved position', async () => {
      const savedPosition = { left: 12, top: 34 };
      const resolved = await scrollBehavior(routeFoo, routeBar, savedPosition);
      expect(resolved).toEqual(savedPosition);
    });

    it('resolves as false if two urls are the same and have no `hash`', async () => {
      const noHashUrl = createRoute('foo', {});
      const resolved = await scrollBehavior(noHashUrl, noHashUrl);
      expect(resolved).toEqual(false);
    });

    it('resolves with pageOffset if `meta.preventScrolling` is `true`', async () => {
      const routeNoScroll = createRoute('foo', {}, 'foo', { preventScrolling: true });
      const resolved = await scrollBehavior(routeNoScroll, routeBar);
      expect(resolved).toEqual(false);
    });

    it('resolves with an element and zero offset if passed `hash` but in IDE target', async () => {
      process.env.VUE_APP_TARGET = 'ide';
      const resolved = await scrollBehavior(routeFoo, routeBar);
      expect(resolved).toEqual({ el: routeFoo.hash, left: 0, top: 0 });
    });

    it('resolves with one nav height offset if passed `hash` but no API `changes` enabled', async () => {
      const routeDocsNoChanges = createRoute(documentationTopicName, {}, 'bar');

      const resolved = await scrollBehavior(routeDocsNoChanges, routeBar);
      expect(resolved).toEqual({
        el: routeDocsNoChanges.hash,
        left: 0,
        top: baseNavHeight + EXTRA_DOCUMENTATION_OFFSET,
      });
    });

    it('resolves with a smaller nav height offset at small breakpoints', async () => {
      const { innerWidth } = window;
      window.innerWidth = 400;

      const routeDocsNoChanges = createRoute(documentationTopicName, {}, 'bar');
      const resolved = await scrollBehavior(routeDocsNoChanges, routeBar);
      expect(resolved).toEqual({
        el: routeDocsNoChanges.hash,
        left: 0,
        top: baseNavHeightSmallBreakpoint + EXTRA_DOCUMENTATION_OFFSET,
      });

      window.innerWidth = innerWidth;
    });

    it('resolves with a double nav height offset if passed `hash` and has API `changes`.', async () => {
      const routeDocsNoChanges = createRoute(documentationTopicName, { changes: 'foo' }, 'bar');

      const resolved = await scrollBehavior(routeDocsNoChanges, routeBar);
      expect(resolved).toEqual({
        el: routeDocsNoChanges.hash,
        left: 0,
        top: baseNavHeight * 2 + EXTRA_DOCUMENTATION_OFFSET,
      });
    });

    it('resolves with `{ left: 0, top: 0 }` if new url has no hash', async () => {
      const noHashUrl = createRoute('foo', {});
      const resolved = await scrollBehavior(noHashUrl, routeBar);
      expect(resolved).toEqual({ left: 0, top: 0 });
    });
  });

  describe('getCurrentLocation', () => {
    it('returns the correct location', () => {
      expect(getCurrentLocation()).toEqual('/foo?bar#baz');
    });
  });

  describe('restoreScrollOnReload', () => {
    it('does not do anything if sessionStorage is empty', async () => {
      sessionStorage.getItem.mockReturnValueOnce(undefined);
      await restoreScrollOnReload();
      expect(scrollToSpy).toHaveBeenCalledTimes(0);
    });

    it('fails silently if the stored value is invalid', async () => {
      const errorSpy = vi.spyOn(console, 'error');
      errorSpy.mockImplementationOnce(() => {});
      sessionStorage.getItem.mockReturnValueOnce('not json');
      await restoreScrollOnReload();
      expect(scrollToSpy).toHaveBeenCalledTimes(0);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('doesnt do anything, if the location is not the same as the one stored', async () => {
      sessionStorage.getItem.mockReturnValueOnce(JSON.stringify({
        location: '/foo',
        x: 5,
        y: 10,
      }));
      await restoreScrollOnReload();
      expect(scrollToSpy).toHaveBeenCalledTimes(0);
    });

    it('scrolls to the last stored coordinates', async () => {
      sessionStorage.getItem.mockReturnValueOnce(JSON.stringify({
        location: '/foo?bar#baz',
        x: 5,
        y: 10,
      }));
      await restoreScrollOnReload();
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
      expect(scrollToSpy).toHaveBeenCalledWith(5, 10);
    });
  });

  describe('saveScrollOnReload', () => {
    it('does not do anything if there is a `hash` in `window.location`', () => {
      saveScrollOnReload();
      expect(sessionStorage.setItem).toHaveBeenCalledTimes(0);
    });

    it('stores the last position in `sessionStorage`', () => {
      mockLocation.mockReturnValueOnce({ hash: null });
      window.pageXOffset = 100;
      window.pageYOffset = 200;
      saveScrollOnReload();
      expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('scrollPosition', JSON.stringify({
        x: 100,
        y: 200,
        location: getCurrentLocation(),
      }));
    });
  });
});
