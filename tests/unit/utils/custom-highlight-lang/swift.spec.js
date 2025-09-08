/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import hljs from 'highlight.js';
import swift from 'docc-render/utils/custom-highlight-lang/swift';

describe('swift', () => {
  let language;

  beforeEach(() => {
    language = swift(hljs);
  });

  it('recognizes the `distributed` keyword', () => {
    expect(language.keywords.keyword.includes('distributed')).toBe(true);
  });

  describe('class mode', () => {
    let mode;

    beforeEach(() => {
      mode = language.contains.find(m => (
        Array.isArray(m.begin)
        && m.begin.length > 0
        && m.begin[0].test('class Foobar {')
      ));
    });

    it('does not have a `beginKeywords` attribute anymore', () => {
      expect(mode).toBeDefined();
      expect(mode.beginKeywords).toBeFalsy();
    });

    it('does have a new `begin` attribute', () => {
      expect(mode).toBeDefined();
      expect(Array.isArray(mode.begin)).toBe(true);
      expect(mode.begin[0]).toEqual(/(struct|protocol|class|extension|enum|actor)/);
    });
  });
});
