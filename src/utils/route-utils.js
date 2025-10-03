/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { pathJoin } from 'docc-render/utils/assets';

const localEnvs = [
  { pathPrefix: '/:locale?', nameSuffix: '-locale' },
];

/**
 * Add prefix to a list of routes.
 * @param {RouteRecord[]} routes - array of routes to wrap
 * @param {string[]} skipRoutes - list of route names to not wrap
 * @param {{ pathPrefix: string, nameSuffix: string}[]} envs
 * @return {RouteRecord[]}
 */
// eslint-disable-next-line import/prefer-default-export
export function addPrefixedRoutes(routes, skipRoutes = [], envs = localEnvs) {
  return envs.reduce((all, current) => all.concat(
    routes
      .filter(route => !skipRoutes.includes(route.name))
      .map(route => ({
        ...route,
        path: pathJoin([current.pathPrefix, route.path]),
        name: route.name + current.nameSuffix,
      })),
  ), []);
}
