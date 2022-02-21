/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  isSingleCharacter,
} from 'docc-render/utils/input-helper';

describe('isSingleCharacter', () => {
  it('detects single characters', () => {
    const singleCharacters = {
      alphanumKey: 'a',
      capitalAlphanumKey: 'A',
      space: ' ',
      number: '8',
      arrow: '>',
      exclamationMarks: '!',
      parenthesis: '(',
      punctuationMarks: '.',
      quotationMarks: "'",
    };

    const nonSingleCharacters = {
      arrowKey: 'ArrowRight',
      tab: 'Tab',
      alt: 'Alt',
      shift: 'Shift',
      meta: 'Meta',
    };

    Object.keys(singleCharacters).forEach((key) => {
      const test = singleCharacters[key];
      expect(isSingleCharacter(test)).toBe(true);
    });

    Object.keys(nonSingleCharacters).forEach((key) => {
      const test = nonSingleCharacters[key];
      expect(isSingleCharacter(test)).toBe(false);
    });
  });
});
