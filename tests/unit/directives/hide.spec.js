/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import hide from 'docc-render/directives/hide';

describe('hide', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  describe('when binding value is `true`', () => {
    beforeEach(() => {
      hide(element, { value: true });
    });

    it('it adds `display: none` to element style', () => {
      expect(element.style.display).toBe('none');
    });
  });

  describe('when binding value is `false`', () => {
    beforeEach(() => {
      hide(element, { value: false });
    });

    it('does not add `display: none` to element style', () => {
      expect(element.style.display).toBe('');
    });
  });
});
