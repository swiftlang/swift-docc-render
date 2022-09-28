/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
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
  getItem: jest.fn(),
  setItem: jest.fn(),
};
const scrollToSpy = jest.fn();
const mockLocation = jest.fn().mockReturnValue({
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
    jest.clearAllMocks();
  });

  describe('scrollBehavior', () => {
    const mockApp = { app: { $nextTick: jest.fn().mockResolvedValue({}) } };
    const scrollBehavior = originalScrollBehavior.bind(mockApp);

    const createRoute = (name, query, hash) => ({ name, query, hash });
    const routeFoo = createRoute('foo', {}, 'foo');
    const routeBar = createRoute('bar', {}, 'bar');

    beforeEach(() => {
      process.env.VUE_APP_TARGET = appTarget;
    });

    it('resolves with the saved position', async () => {
      const savedPosition = { foo: 'foo' };
      const resolved = await scrollBehavior(routeFoo, routeBar, savedPosition);
      expect(resolved).toEqual(savedPosition);
    });

    it('resolves with a selector and `y:0` offset if passed `hash` but in IDE target', async () => {
      process.env.VUE_APP_TARGET = 'ide';
      const resolved = await scrollBehavior(routeFoo, routeBar);
      expect(resolved).toEqual({ selector: routeFoo.hash, offset: { x: 0, y: 0 } });
    });

    it('resolves with one nav height offset if passed `hash` but no API `changes` enabled', async () => {
      const routeDocsNoChanges = createRoute(documentationTopicName, {}, 'bar');

      const resolved = await scrollBehavior(routeDocsNoChanges, routeBar);
      expect(resolved).toEqual({
        selector: routeDocsNoChanges.hash,
        offset: { x: 0, y: baseNavHeight + EXTRA_DOCUMENTATION_OFFSET },
      });
    });

    it('resolves with a smaller nav height offset at small breakpoints', async () => {
      const { innerWidth } = window;
      window.innerWidth = 400;

      const routeDocsNoChanges = createRoute(documentationTopicName, {}, 'bar');
      const resolved = await scrollBehavior(routeDocsNoChanges, routeBar);
      expect(resolved).toEqual({
        selector: routeDocsNoChanges.hash,
        offset: { x: 0, y: baseNavHeightSmallBreakpoint + EXTRA_DOCUMENTATION_OFFSET },
      });

      window.innerWidth = innerWidth;
    });

    it('resolves with a double nav height offset if passed `hash` and has API `changes`.', async () => {
      const routeDocsNoChanges = createRoute(documentationTopicName, { changes: 'foo' }, 'bar');

      const resolved = await scrollBehavior(routeDocsNoChanges, routeBar);
      expect(resolved).toEqual({
        selector: routeDocsNoChanges.hash,
        offset: { x: 0, y: baseNavHeight * 2 + EXTRA_DOCUMENTATION_OFFSET },
      });
    });

    it('resolves as false if two urls are the same and have no `hash`', async () => {
      const noHashUrl = createRoute('foo', {});
      const resolved = await scrollBehavior(noHashUrl, noHashUrl);
      expect(resolved).toEqual(false);
    });

    it('resolves with `{ x: 0, y: 0 }` if new url without hash', async () => {
      const noHashUrl = createRoute('foo', {});
      const resolved = await scrollBehavior(noHashUrl, routeBar);
      expect(resolved).toEqual({ x: 0, y: 0 });
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
      const errorSpy = jest.spyOn(console, 'error');
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
