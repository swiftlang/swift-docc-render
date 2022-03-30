/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { last } from '@/utils/arrays';

describe('arrays', () => {
  describe('last', () => {
    it('returns the last item in an array', () => {
      expect(last([1, 2, 3])).toEqual(3);
      expect(last([1])).toEqual(1);
      expect(last([])).toEqual(undefined);
    });
  });
});
