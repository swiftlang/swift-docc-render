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
  fetchData,
  fetchDataForRouteEnter,
  shouldFetchDataForRouteUpdate,
  fetchAPIChangesForRoute,
  fetchIndexPathsData,
} from 'docc-render/utils/data';
import emitWarningForSchemaVersionMismatch from 'docc-render/utils/schema-version-check';
import FetchError from 'docc-render/errors/FetchError';
import RedirectError from 'docc-render/errors/RedirectError';

jest.mock('docc-render/utils/schema-version-check', () => jest.fn());

const mockBaseUrl = jest.fn().mockReturnValue('/');

jest.mock('docc-render/utils/theme-settings', () => ({
  get baseUrl() { return mockBaseUrl(); },
}));

const badFetchResponse = {
  ok: false,
  status: 500,
};
const goodFetchResponse = {
  ok: true,
  json: () => Promise.resolve({ foobar: 'foobar' }),
};
const notFoundFetchResposne = {
  ok: false,
  status: 404,
};
const redirectResponse = {
  redirected: true,
  ok: true,
  url: 'https://localhost:8080/data/documentation/foo/framework.json?language=objc',
};

const badIDEFetchResponse = {
  ok: false,
  status: 0,
  json: () => Promise.reject(new Error()),
};

const goodIDEFetchResponse = {
  ok: false,
  status: 0,
  json: () => Promise.resolve({ foobar: 'foobar' }),
};

describe('fetchData', () => {
  let originalNodeEnv;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('calls `fetch` to retrieve data from a remote source', async () => {
    window.fetch = jest.fn().mockImplementation(() => goodFetchResponse);
    const data = await fetchData('/data/tutorials/augmented-reality/tutorials.json');
    await expect(data).toEqual(await goodFetchResponse.json());
  });

  it('throws non "OK" responses', async () => {
    window.fetch = jest.fn().mockImplementation(() => badFetchResponse);
    try {
      await fetchData('/data/tutorials/augmented-responses/tutorials.json');
    } catch (error) {
      expect(error).toEqual(badFetchResponse);
    }
  });

  it('sends data to check for version mismatch', async () => {
    const schemaVersion = { major: 1, minor: 0, patch: 0 };
    window.fetch = jest.fn()
      .mockResolvedValue({ ...goodFetchResponse, json: () => Promise.resolve({ schemaVersion }) });
    await fetchData('/data/tutorials/augmented-reality/tutorials.json');
    expect(emitWarningForSchemaVersionMismatch).toHaveBeenCalledTimes(1);

    expect(emitWarningForSchemaVersionMismatch).toHaveBeenCalledWith(schemaVersion);
  });

  it('throws a RedirectError, when a redirect response is present', async () => {
    window.fetch = jest.fn().mockImplementation(() => redirectResponse);
    try {
      await fetchData('/data/tutorials/augmented-responses/tutorials.json');
    } catch (err) {
      expect(err).toBeInstanceOf(RedirectError);
      expect(err.response).toEqual(redirectResponse);
      expect(err.location).toEqual(redirectResponse.url);
    }
  });

  describe('with an IDE target', () => {
    let originalTarget;

    beforeEach(() => {
      originalTarget = process.env.VUE_APP_TARGET;
      process.env.VUE_APP_TARGET = 'ide';
    });

    afterEach(() => {
      process.env.VUE_APP_TARGET = originalTarget;
    });

    it('calls `fetch` to retrieve data, handling a response status of 0', async () => {
      window.fetch = jest.fn().mockImplementation(() => goodIDEFetchResponse);
      const data = await fetchData('/data/tutorials/augmented-reality/tutorials.json');
      await expect(data).toEqual(await goodIDEFetchResponse.json());
    });

    it('throws for bad responses with a status other than 0', async () => {
      window.fetch = jest.fn().mockImplementation(() => badFetchResponse);
      try {
        await fetchData('/data/tutorials/augmented-reality/learn.json');
      } catch (error) {
        expect(error).toEqual(badFetchResponse);
      }
    });
  });
});

describe('fetchDataForRouteEnter', () => {
  let originalNodeEnv;

  const to = {
    name: 'technology-tutorials',
    path: '/tutorials/augmented-reality/tutorials',
  };
  const from = {};
  const next = jest.fn();

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('calls `fetchData` with the right path', async () => {
    window.fetch = jest.fn().mockImplementation(() => goodFetchResponse);

    const data = await fetchDataForRouteEnter(to, from, next);
    await expect(window.fetch).toHaveBeenCalledWith(new URL(
      '/data/tutorials/augmented-reality/tutorials.json',
      window.location.href,
    ).href);
    await expect(data).toEqual(await goodFetchResponse.json());

    window.fetch.mockRestore();
  });

  it('calls `fetchData` with a configurable base url', async () => {
    mockBaseUrl.mockReturnValueOnce('/base-prefix/');
    window.fetch = jest.fn().mockImplementation(() => goodFetchResponse);

    const data = await fetchDataForRouteEnter(to, from, next);
    await expect(window.fetch).toHaveBeenCalledWith(new URL(
      '/base-prefix/data/tutorials/augmented-reality/tutorials.json',
      window.location.href,
    ).href);
    await expect(data).toEqual(await goodFetchResponse.json());

    window.fetch.mockRestore();
  });

  it('calls `fetchData` with the right query string', async () => {
    window.fetch = jest.fn().mockResolvedValue(goodFetchResponse);

    const toWithParams = { ...to, query: { foo: 'bar' } };
    const data = await fetchDataForRouteEnter(toWithParams, from, next);
    expect(window.fetch.mock.calls[0][0].toString()).toEqual(new URL(
      '/data/tutorials/augmented-reality/tutorials.json?foo=bar',
      window.location.href,
    ).toString());
    expect(data).toEqual(await goodFetchResponse.json());

    window.fetch.mockRestore();
  });

  it('calls the `next` fn with a not-found route for 404s', async () => {
    window.fetch = jest.fn().mockImplementation(() => notFoundFetchResposne);

    await fetchDataForRouteEnter(to, from, next);
    await expect(next).toHaveBeenCalledWith({
      name: 'not-found',
      params: ['/tutorials/augmented-reality/tutorials'],
    });

    window.fetch.mockRestore();
  });

  it('throws false if fetchDataForRouteEnter gets rejected and VUE_APP_TARGET is ide', async () => {
    process.env.VUE_APP_TARGET = 'ide';
    const errorSpy = jest.spyOn(console, 'error').mockReturnValue('');
    window.fetch = jest.fn().mockImplementation(() => badIDEFetchResponse);

    await expect(fetchDataForRouteEnter(to, from, next)).rejects.toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(new Error());

    window.fetch.mockRestore();
    process.env.VUE_APP_TARGET = '';
  });

  it('throws with a new path, when `fetch` has been redirected', async () => {
    window.fetch = jest.fn().mockResolvedValue(redirectResponse);

    await expect(fetchDataForRouteEnter(to, from, next))
      .rejects
      .toBe('/documentation/foo/framework?language=objc');
    expect(next).toHaveBeenCalledTimes(0);
    window.fetch.mockRestore();
  });

  it('calls the `next` fn with a `FetchError`', async () => {
    window.fetch = jest.fn().mockImplementation(() => badFetchResponse);

    try {
      await fetchDataForRouteEnter(to, from, next);
    } catch (error) {
      expect(next).toHaveBeenCalledWith(new FetchError(to));
    } finally {
      window.fetch.mockRestore();
    }
  });

  it('removes trailing slashes from paths', async () => {
    window.fetch = jest.fn().mockImplementation(() => goodFetchResponse);

    const data = await fetchDataForRouteEnter({
      name: 'technology-tutorials',
      path: '/tutorials/augmented-reality/tutorials/',
    }, from, next);

    await expect(window.fetch).toHaveBeenLastCalledWith(new URL(
      '/data/tutorials/augmented-reality/tutorials.json',
      window.location.href,
    ).href);
    await expect(data).toEqual(await goodFetchResponse.json());

    window.fetch.mockRestore();
  });
});

// This is testeed in more detail in `url-helper.spec.js`.
describe('shouldFetchDataForRouteUpdate', () => {
  it('returns false for equivalent locations', () => {
    expect(shouldFetchDataForRouteUpdate({
      name: 'foo',
      path: '/bar',
      hash: '#baz',
    }, {
      name: 'foo',
      path: '/bar',
      hash: '#qux',
    })).toBe(false);
  });

  it('returns true for equivalent locations', () => {
    expect(shouldFetchDataForRouteUpdate({
      name: 'foo',
      path: '/bar',
    }, {
      name: 'foo',
      path: '/baz',
    })).toBe(true);
  });

  it('returns false for the same route with the same path and empty query parameters', () => {
    expect(shouldFetchDataForRouteUpdate({
      name: 'foo',
      path: '/bar',
      hash: '#baz',
      query: {},
    }, {
      name: 'foo',
      path: '/bar',
      query: {},
    })).toBe(false);
  });

  it('returns false for the same route with the same path and non-empty query parameters', () => {
    expect(shouldFetchDataForRouteUpdate({
      name: 'foo',
      path: '/bar',
      query: { param: 'value' },
    }, {
      name: 'foo',
      path: '/bar',
      query: { param: 'value' },
    })).toBe(false);
  });
});

describe('fetchAPIChangesForRoute', () => {
  let originalNodeEnv;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'production';

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  const route = {
    path: '/documentation/foo',
  };

  it('calls `fetchData` with the right path', async () => {
    window.fetch = jest.fn().mockImplementation(() => goodFetchResponse);

    const data = await fetchAPIChangesForRoute(route, 'latest_minor');
    expect(window.fetch.mock.calls[0][0].toString()).toEqual(new URL(
      '/data/diffs/documentation/foo.json?changes=latest_minor',
      window.location.href,
    ).toString());
    await expect(data).toEqual(await goodFetchResponse.json());

    window.fetch.mockRestore();
  });
});

describe('fetchIndexPathsData', () => {
  it('fetches the data for the index/index.json', async () => {
    window.fetch = jest.fn().mockImplementation(() => goodFetchResponse);

    const data = await fetchIndexPathsData();
    expect(fetch).toHaveBeenLastCalledWith('http://localhost/index/index.json');
    expect(data).toEqual({ foobar: 'foobar' });
  });
});
