/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { localDocCArchive } from '../../vite.config';

describe('local DocC archive middleware', () => {
  it('returns a 404 for missing archive resources', () => {
    let middleware;
    localDocCArchive('/missing/archive').configureServer({
      middlewares: {
        use: vi.fn((handler) => {
          middleware = handler;
        }),
      },
    });
    const response = { end: vi.fn() };
    const next = vi.fn();

    middleware({ url: '/data/documentation/missing.json' }, response, next);

    expect(response.statusCode).toBe(404);
    expect(response.end).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });
});
