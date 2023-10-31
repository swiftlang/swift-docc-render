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
  AssetOrientation,
  pathJoin,
  normalizeRelativePath,
  getOrientation,
} from 'docc-render/utils/assets';

let normalizePath;
const absoluteBaseUrl = 'https://foo.com';

function importDeps() {
  jest.resetModules();
  // eslint-disable-next-line global-require
  ({ normalizePath } = require('@/utils/assets'));
}

Object.defineProperty(window, 'location', {
  value: {
    href: absoluteBaseUrl,
  },
});

describe('assets', () => {
  describe('pathJoin', () => {
    it.each([
      [['foo', 'bar'], 'foo/bar'],
      [['foo/', 'bar'], 'foo/bar'],
      [['foo', '/bar'], 'foo/bar'],
      [['foo/', '/bar'], 'foo/bar'],
      [['foo/', 'bar/'], 'foo/bar/'],
      [['foo/', '/bar/'], 'foo/bar/'],
      [['/foo', '/bar'], '/foo/bar'],
      [['/foo', 'bar/'], '/foo/bar/'],
      [['/foo/', 'bar/'], '/foo/bar/'],
      [['/foo/', '/bar/'], '/foo/bar/'],
    ])('joins params %s into %s', (params, expected) => {
      expect(pathJoin(params)).toEqual(expected);
    });
  });
  describe('normalizePath', () => {
    it('works correctly if baseurl is just a slash', () => {
      window.baseUrl = '/';
      importDeps();
      expect(normalizePath('/foo')).toBe('/foo');
    });

    it('works correctly with multiple urls', () => {
      window.baseUrl = '/';
      importDeps();
      expect(normalizePath(['/foo', 'blah'])).toBe('/foo/blah');
    });

    it('works when both have slashes leading', () => {
      window.baseUrl = '/base';
      importDeps();
      expect(normalizePath('/foo')).toBe('/base/foo');
    });

    it('does not change, if passed a url', () => {
      expect(normalizePath('https://foo.com')).toBe('https://foo.com');
      expect(normalizePath('http://foo.com')).toBe('http://foo.com');
    });

    it('does not change, if path is relative', () => {
      window.baseUrl = '/base';
      importDeps();
      expect(normalizePath('foo/bar')).toBe('foo/bar');
    });

    it('does not change, if the path is already prefixed', () => {
      window.baseUrl = '/base';
      importDeps();
      expect(normalizePath('/base/foo')).toBe('/base/foo');
    });

    it('returns empty, if nothing passed', () => {
      expect(normalizePath('')).toBe('');
      expect(normalizePath(undefined)).toBe(undefined);
      expect(normalizePath(null)).toBe(null);
    });
  });
  describe('normalizeRelativePath', () => {
    it('adds a `/` if path starts without it', () => {
      expect(normalizeRelativePath('foo')).toBe('/foo');
    });

    it('does not add a `/` if path starts it', () => {
      expect(normalizeRelativePath('/foo')).toBe('/foo');
    });
  });

  describe('getOrientation', () => {
    // simulate immediately loading an image with the given dimensions for
    // testing purposes
    function mockLoadedImage(width, height) {
      Object.defineProperty(global.Image.prototype, 'onload', {
        set(onload) {
          this.width = width;
          this.height = height;
          setTimeout(onload);
        },
        configurable: true,
      });
    }

    it('returns landscape for assets that are wider than they are tall', async () => {
      mockLoadedImage(300, 200);
      const orientation = await getOrientation('foo');
      expect(orientation).toBe(AssetOrientation.landscape);
    });

    it('returns portrait for assets that are taller than they are wide', async () => {
      mockLoadedImage(200, 300);
      const orientation = await getOrientation('foo');
      expect(orientation).toBe(AssetOrientation.portrait);
    });

    it('returns square for assets with equal width and height', async () => {
      mockLoadedImage(100, 100);
      const orientation = await getOrientation('foo');
      expect(orientation).toBe(AssetOrientation.square);
    });
  });
});
