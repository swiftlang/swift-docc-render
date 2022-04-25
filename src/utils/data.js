/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { pathJoin } from 'docc-render/utils/assets';
import { queryStringForParams, areEquivalentLocations } from 'docc-render/utils/url-helper';
import emitWarningForSchemaVersionMismatch from 'docc-render/utils/schema-version-check';
import { baseUrl } from 'docc-render/utils/theme-settings';

export class FetchError extends Error {
  constructor(route) {
    super('Unable to fetch data');
    this.route = route;
  }
}

export async function fetchData(path, params = {}, options) {
  function isBadResponse(response) {
    // When this is running in an IDE target, the `fetch` API will be used with
    // custom URL schemes. Right now, WebKit will return successful responses
    // with an HTTP status of `0`, which is normally not considered an "OK"
    // response, so this needs to be special cased as a good response here.
    // Otherwise, the `ok` property will return true for any http status within
    // the range of 200-299
    if (process.env.VUE_APP_TARGET === 'ide' && response.status === 0) {
      return false;
    }

    return !response.ok;
  }

  const url = new URL(path, window.location.href);
  const queryString = queryStringForParams(params);
  if (queryString) {
    url.search = queryString;
  }

  const response = await fetch(url.href, options);
  if (isBadResponse(response)) {
    throw response;
  }

  const json = await response.json();
  emitWarningForSchemaVersionMismatch(json.schemaVersion);
  return json;
}

function createDataPath(path) {
  const dataPath = path.replace(/\/$/, '');
  return `${pathJoin([baseUrl, 'data', dataPath])}.json`;
}

export async function fetchDataForRouteEnter(to, from, next) {
  const path = createDataPath(to.path);

  let data;
  try {
    data = await fetchData(path, to.query, {
      credentials: 'include',
      mode: 'no-cors',
    });
  } catch (error) {
    if (process.env.VUE_APP_TARGET === 'ide') {
      console.error(error);
      // We need to throw false to pass false to the following `catch` function
      // so we stop the navigation by calling `next(false)`
      /* eslint-disable no-throw-literal */
      throw false;
    }

    if (error.status && error.status === 404) {
      // route to 404 page if missing data, but not in IDE build
      next({
        name: 'not-found',
        params: [to.path],
      });
    } else {
      next(new FetchError(to));
    }
  }

  return data;
}

export function shouldFetchDataForRouteUpdate(to, from) {
  return !areEquivalentLocations(to, from);
}

export async function fetchAPIChangesForRoute(route, changes) {
  const path = createDataPath(`/diffs${route.path}`);

  let data;
  try {
    data = await fetchData(path, {
      ...route.query,
      changes,
    });
  } catch (error) {
    throw new Error(`Unable to fetch API changes: ${error}`);
  }

  return data;
}

export function clone(jsonObject) {
  return JSON.parse(JSON.stringify(jsonObject));
}

export async function fetchIndexPathsData() {
  const path = new URL(`${pathJoin([baseUrl, 'index/index.json'])}`, window.location.href);
  return fetchData(path);
}
