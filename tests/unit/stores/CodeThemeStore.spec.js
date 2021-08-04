/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import CodeThemeStore from 'docc-render/stores/CodeThemeStore';

describe('CodeThemeStore', () => {
  beforeEach(() => {
    CodeThemeStore.reset();
  });

  it('has a default state', () => {
    expect(CodeThemeStore.state).toEqual({
      codeColors: null,
    });
  });

  it('resets all the state properties', () => {
    CodeThemeStore.updateCodeColors({
      background: {
        red: 100,
        green: 50,
        blue: 255,
        alpha: 0.5,
      },
    });

    CodeThemeStore.reset();

    expect(CodeThemeStore.state).toEqual({
      codeColors: null,
    });
  });

  describe('updateCodeColors', () => {
    const codeColors = {
      background: {
        red: 100, green: 50, blue: 255, alpha: 0.5,
      },
      lineHighlight: {
        red: 80, green: 5, blue: 0, alpha: 0.6,
      },
      comment: {
        red: 0, green: 50, blue: 0, alpha: 0.2,
      },
    };

    beforeEach(() => {
      CodeThemeStore.updateCodeColors(codeColors);
    });

    it('converts the colors to RGBA values', () => {
      expect(CodeThemeStore.state.codeColors).toEqual({
        background: 'rgba(100, 50, 255, 0.5)',
        lineHighlight: 'rgba(80, 5, 0, 0.6)',
        comment: 'rgba(0, 50, 0, 0.2)',
      });
    });
  });
});
