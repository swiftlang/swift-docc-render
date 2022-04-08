/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { isEqual, last } from '@/utils/arrays';

describe('arrays', () => {
  describe('last', () => {
    it('returns the last item in an array', () => {
      expect(last([1, 2, 3])).toEqual(3);
      expect(last([1])).toEqual(1);
      expect(last([])).toEqual(undefined);
    });
  });

  describe('isEqual', () => {
    const first = [1, 2, 3];
    const second = [1, 2];
    const firstStrings = ['1', '2', '3'];

    it('returns true, if passed the same array', () => {
      expect(isEqual(first, first)).toBe(true);
    });

    it('returns true, if passed an array, that looks similar', () => {
      expect(isEqual(first, first.slice(0))).toBe(true);
    });

    it('returns false, if the two arrays are different', () => {
      expect(isEqual(first, second)).toBe(false);
    });

    it('returns false, if the array does not have the same item types', () => {
      expect(isEqual(first, firstStrings)).toBe(false);
    });

    it('compares arrays of objects', () => {
      expect(isEqual(
        [{ foo: 'foo' }],
        [{ foo: 'foo' }],
      )).toBe(true);
    });
  });
});
