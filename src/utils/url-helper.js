/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { normalizeUrl } from 'docc-render/utils/assets';
import TechnologiesQueryParams from 'docc-render/constants/TechnologiesQueryParams';

export function queryStringForParams(params = {}) {
  return Object.entries(params).reduce((pairs, [name, value]) => (
    value
      ? pairs.concat(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
      : pairs
  ), []).join('&');
}

export function buildUrl(url, { changes, language, context } = {}) {
  const [urlWithoutFragment, fragment] = url.split('#');
  const hasQueryParams = urlWithoutFragment.match(/\?.*/);
  const query = queryStringForParams({ changes, language, context });

  const combinator = hasQueryParams ? '&' : '?';

  const pathString = fragment ? urlWithoutFragment : url;
  const queryString = query ? `${combinator}${query}` : '';
  const fragmentString = fragment ? `#${fragment}` : '';

  return `${pathString}${queryString}${fragmentString}`;
}

// Whether the given routes are equivalent.
//
// Routes are considered equivalent if they have the same name, path, and query parameters, with the
// exception of `changes`,`input` and `tags` query parameters,
// which are not considered in the equivalency.
export function areEquivalentLocations(routeA, routeB) {
  // Remove the aforementioned query parameters because they're not considered in equivalency.
  const {
    query: {
      changes: routeAChanges,
      [TechnologiesQueryParams.input]: technologiesAQuery,
      [TechnologiesQueryParams.tags]: technologiesATags,
      ...routeAQuery
    } = {},
  } = routeA;

  const {
    query: {
      changes: routeBChanges,
      [TechnologiesQueryParams.input]: technologiesBQuery,
      [TechnologiesQueryParams.tags]: technologiesBTags,
      ...routeBQuery
    } = {},
  } = routeB;

  return routeA.name === routeB.name && (JSON.stringify({
    path: routeA.path,
    query: routeAQuery,
  }) === JSON.stringify({
    path: routeB.path,
    query: routeBQuery,
  }));
}

// Resolve a given path absolute URL object.
//
// @param {String} path A URL path.
// @param {String} domainPath An optional base URL to resolve against. The default
//   value will be the origin of the current website.
// @return {Object} The absolute URL object resulting from resolving the given path
//   with the current website origin.
//
// Examples:
// if baseURL is '/'
// getAbsoluteUrl('/bar') // URL { href: http://localhost:8080/bar }
// getAbsoluteUrl('/bar', 'http://example.com') // URL { href: http://example.com/bar }
// if baseURL is '/foo/'
// getAssetsAbsoluteUrl('/bar') // URL { href: http://localhost:8080/foo/bar }
// getAssetsAbsoluteUrl('/bar', 'http://example.com') // URL { href: http://example.com/foo/bar }
export function getAbsoluteUrl(path, domainPath = window.location.href) {
  return new URL(normalizeUrl(path), domainPath);
}
// Resolve a given path into a full, absolute URL.
//
// @param {String} path A URL path.
// @param {String} domainPath An optional base URL to resolve against. The default
//   value will be the origin of the current website.
// @return {String} The absolute URL resulting from resolving the given path
//   with the current website origin.
//
// Examples:
// if baseURL is '/'
// getAbsoluteUrl('/bar') // http://localhost:8080/bar
// getAbsoluteUrl('/bar', 'http://example.com') // http://example.com/bar
// if baseURL is '/foo/'
// resolveAssetsAbsoluteUrl('/bar') // http://localhost:8080/foo/bar
// resolveAssetsAbsoluteUrl('/bar', 'http://example.com') // http://example.com/foo/bar
export function resolveAbsoluteUrl(path, domainPath) {
  return getAbsoluteUrl(path, domainPath).href;
}
