/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// we should consider moving `normalizeAssetUrl` here and renaming it since it
// is more generic than its name implies (no asset-specific logic)
import { normalizeAssetUrl as normalizePath } from 'docc-render/utils/assets';
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

// Resolve a given relative path into a full, absolute URL.
//
// @param {String} relativePath A relative path.
// @return {String} The absolute URL corresponding to the given path.
//
//
// Note that the same call may result in different output for the same input
// depending on where/how this instance of DocC-Render is being hosted.
//
// Example:
//
// resolveAbsoluteUrl('/foo/bar') // http://localhost:8080/foo/bar
// resolveAbsoluteUrl('/foo/bar') // https://mportiz08.github.io/example/foo/bar
//
export function resolveAbsoluteUrl(relativePath) {
  return new URL(normalizePath(relativePath), window.location.origin).href;
}
