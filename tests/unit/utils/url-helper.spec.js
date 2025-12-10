/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import TechnologiesQueryParams from 'docc-render/constants/TechnologiesQueryParams';

let areEquivalentLocations;
let buildUrl;
let resolveAbsoluteUrl;
let isAbsoluteUrl;

const normalizePathMock = jest.fn().mockImplementation(n => n);

const mockAssets = {
  normalizePath: normalizePathMock,
};

jest.mock('docc-render/utils/assets', () => (mockAssets));

function importDeps() {
  jest.resetModules();
  // eslint-disable-next-line global-require
  ({
    areEquivalentLocations,
    buildUrl,
    resolveAbsoluteUrl,
    isAbsoluteUrl,
  // eslint-disable-next-line global-require
  } = require('@/utils/url-helper'));
}

describe('areEquivalentLocations', () => {
  beforeEach(() => {
    importDeps();
    jest.clearAllMocks();
  });

  it('returns false for the same route with a different path', () => {
    expect(areEquivalentLocations({
      name: 'foo',
      path: '/bar',
    }, {
      name: 'foo',
      path: '/baz',
    })).toBe(false);
  });

  it('returns false for the same route and path with different params', () => {
    expect(areEquivalentLocations({
      name: 'foo',
      path: '/bar',
      query: { baz: 'baz' },
    }, {
      name: 'foo',
      path: '/bar',
    })).toBe(false);
  });

  it('returns true for the same route with the same path', () => {
    expect(areEquivalentLocations({
      name: 'foo',
      path: '/bar',
      hash: '#baz',
    }, {
      name: 'foo',
      path: '/bar',
      hash: '#qux',
    })).toBe(true);
  });

  it('returns true for the same route, path, all queries but changes query', () => {
    expect(areEquivalentLocations({
      name: 'foo',
      path: '/bar',
      query: {
        param: 'value',
        changes: 'a value',
      },
    }, {
      name: 'foo',
      path: '/bar',
      query: {
        param: 'value',
        changes: 'a different value',
      },
    })).toBe(true);
  });

  it('returns true for the same route, path, all queries but input or tags changes', () => {
    expect(areEquivalentLocations({
      name: 'foo',
      path: '/bar',
      query: {
        param: 'value',
        [TechnologiesQueryParams.tags]: 'a,b,c',
        [TechnologiesQueryParams.input]: 'foo',
      },
    }, {
      name: 'foo',
      path: '/bar',
      query: {
        param: 'value',
        [TechnologiesQueryParams.tags]: 'c,d,e',
        [TechnologiesQueryParams.input]: 'bar',
      },
    })).toBe(true);
  });

  it('returns false for the same route, path, different queries', () => {
    expect(areEquivalentLocations({
      name: 'foo',
      path: '/bar',
      query: {
        param: 'value',
        changes: 'a value',
      },
    }, {
      name: 'foo',
      path: '/bar',
      query: {
        param: 'another value',
        changes: 'a different value',
      },
    })).toBe(false);
  });
});

describe('buildUrl', () => {
  it('works without any query params', () => {
    expect(buildUrl('/docs')).toEqual('/docs');
  });

  it('appends only `changes`, `context` and `language` query parameters', () => {
    expect(buildUrl('/docs', {
      changes: 'abc', language: 'cde', context: 'context', foo: 'foo',
    }))
      .toEqual('/docs?changes=abc&language=cde&context=context');
  });

  it('appends query params to url with already existing params', () => {
    expect(buildUrl('/docs?language=objc', { changes: 'abc', foo: 'foo' }))
      .toEqual('/docs?language=objc&changes=abc');
  });

  it('appends query params to urls with hash tags', () => {
    expect(buildUrl('/docs#hash', { changes: 'abc' })).toEqual('/docs?changes=abc#hash');
  });

  it('appends query params to urls with hash tags and existing queries', () => {
    expect(buildUrl('/docs?foo=bar#hash', { changes: 'abc' })).toEqual('/docs?foo=bar&changes=abc#hash');
  });
});

describe('resolveAbsoluteUrl', () => {
  it('returns an absolute URL for a given path', () => {
    expect(resolveAbsoluteUrl('/foo/bar')).toBe('http://localhost/foo/bar');
    expect(resolveAbsoluteUrl('foo/bar')).toBe('http://localhost/foo/bar');
  });

  it('resolves against the host and base path of the current environment', () => {
    const { location } = window;
    normalizePathMock.mockImplementation(n => `/foo${n}`);
    importDeps();
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com'),
    });
    expect(resolveAbsoluteUrl('/bar/baz')).toBe('https://example.com/foo/bar/baz');

    normalizePathMock.mockImplementation(n => n);
    expect(resolveAbsoluteUrl('foobar/baz')).toBe('https://example.com/foobar/baz');

    Object.defineProperty(window, 'location', { value: location });
  });

  it('can resolve against a provided base URL', () => {
    expect(resolveAbsoluteUrl('/foo/bar', 'https://swift.org'))
      .toBe('https://swift.org/foo/bar');
    expect(resolveAbsoluteUrl('foobar', 'https://swift.org'))
      .toBe('https://swift.org/foobar');
    expect(resolveAbsoluteUrl('foo/bar', 'https://swift.org/blah'))
      .toBe('https://swift.org/foo/bar');
  });
});

describe('isAbsoluteUrl', () => {
  beforeEach(() => {
    importDeps();
    jest.clearAllMocks();
  });

  it('returns true for absolute URLs', () => {
    expect(isAbsoluteUrl('https://example.com')).toBe(true);
    expect(isAbsoluteUrl('https://example.com/path')).toBe(true);
  });

  it('returns true for other protocol schemes', () => {
    expect(isAbsoluteUrl('mailto:test@example.com')).toBe(true);
    expect(isAbsoluteUrl('tel:+1234567890')).toBe(true);
  });

  it('returns false for relative paths starting with /', () => {
    expect(isAbsoluteUrl('/relative/path')).toBe(false);
    expect(isAbsoluteUrl('/')).toBe(false);
  });

  it('returns false for relative paths not starting with /', () => {
    expect(isAbsoluteUrl('relative/path')).toBe(false);
    expect(isAbsoluteUrl('./current/path')).toBe(false);
  });

  it('returns false for empty or invalid URLs', () => {
    expect(isAbsoluteUrl('')).toBe(false);
    expect(isAbsoluteUrl('not-a-valid-url')).toBe(false);
  });
});
