/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { safeHighlightPattern } from '@/utils/search-utils';

describe('search-utils', () => {
  it('returns a safe pattern for highlighting', () => {
    expect(safeHighlightPattern('text $ % ( * .'))
      .toEqual(/t\s*e\s*x\s*t\s*\$\s*%\s*\(\s*\*\s*\./gi);
  });
});
