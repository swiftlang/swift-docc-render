/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { addPrefixedRoutes } from '@/utils/route-utils';

const routes = [
  {
    name: 'a',
    path: '/path/to/a',
    meta: { a: 'a' },
  },
  {
    name: 'b',
    path: '/path/to/b',
    meta: { b: 'b' },
  },
];

describe('route-utils', () => {
  it('transforms routes for each environment', () => {
    const result = addPrefixedRoutes(routes);
    expect(result).toHaveLength(2);
    // assert extra route data is kept, `name` and `path` are changed
    expect(result).toEqual([
      { meta: { a: 'a' }, name: 'a-locale', path: '/:locale?/path/to/a' },
      { meta: { b: 'b' }, name: 'b-locale', path: '/:locale?/path/to/b' },
    ]);
  });

  it('allows you to ignore routes for transformation', () => {
    const result = addPrefixedRoutes(routes, ['b']);
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      { meta: { a: 'a' }, name: 'a-locale', path: '/:locale?/path/to/a' },
    ]);
  });

  it('allows you to pass custom environments, overriding the default ones', () => {
    const result = addPrefixedRoutes(routes, [], [{
      pathPrefix: '/foo/bar',
      nameSuffix: '-foo',
    }]);
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { meta: { a: 'a' }, name: 'a-foo', path: '/foo/bar/path/to/a' },
      { meta: { b: 'b' }, name: 'b-foo', path: '/foo/bar/path/to/b' },
    ]);
  });
});
