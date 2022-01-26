/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { normalizeAssetUrl, pathJoin } from 'docc-render/utils/assets';

const mockBaseUrl = jest.fn().mockReturnValue('/');
const absoluteBaseUrl = 'https://foo.com';

jest.mock('@/utils/theme-settings', () => ({
  get baseUrl() { return mockBaseUrl(); },
}));

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
  describe('normalizeAssetUrl', () => {
    it('works correctly if baseurl is just a slash', () => {
      mockBaseUrl.mockReturnValue('/');
      expect(normalizeAssetUrl('/foo')).toBe('/foo');
    });

    it('works when both have slashes leading', () => {
      mockBaseUrl.mockReturnValue('/base/');
      expect(normalizeAssetUrl('/foo')).toBe('/base/foo');
    });

    it('does not change, if passed a url', () => {
      expect(normalizeAssetUrl('https://foo.com')).toBe('https://foo.com');
      expect(normalizeAssetUrl('http://foo.com')).toBe('http://foo.com');
    });

    it('does not change, if path is relative', () => {
      mockBaseUrl.mockReturnValue('/base');
      expect(normalizeAssetUrl('foo/bar')).toBe('foo/bar');
    });

    it('does not change, if the path is already prefixed', () => {
      mockBaseUrl.mockReturnValue('/base');
      expect(normalizeAssetUrl('/base/foo')).toBe('/base/foo');
    });

    it('returns empty, if nothing passed', () => {
      expect(normalizeAssetUrl('')).toBe('');
      expect(normalizeAssetUrl(undefined)).toBe(undefined);
      expect(normalizeAssetUrl(null)).toBe(null);
    });
  });
});
