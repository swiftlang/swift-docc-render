/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { objectToCustomProperties } from 'docc-render/utils/themes';

describe('themes', () => {
  it('works if passed `undefined`', () => {
    expect(objectToCustomProperties(undefined)).toEqual({});
  });

  it('works if passed `null`', () => {
    expect(objectToCustomProperties(null)).toEqual({});
  });

  it('converts a deeply nested object into an object with custom css properties', () => {
    const treeToWalk = {
      level1: {
        prop1: 'value1',
        level2: {
          prop2: 'value2',
        },
      },
      level1_1: 'value1_1',
      'level_1-2': 'value1_2',
      levelOneItemFour: 1,
    };

    expect(objectToCustomProperties(treeToWalk))
      .toEqual({
        '--level1-prop1': 'value1',
        '--level1-level2-prop2': 'value2',
        '--level1_1': 'value1_1',
        '--level_1-2': 'value1_2',
        '--levelOneItemFour': 1,
      });
  });

  it('supports light/dark mode variants', () => {
    const treeToWalk = {
      button: {
        background: {
          light: '#ffffff',
          dark: '#000000',
        },
      },
    };
    expect(objectToCustomProperties(treeToWalk, 'light')).toEqual({
      '--button-background': treeToWalk.button.background.light,
    });
    expect(objectToCustomProperties(treeToWalk, 'dark')).toEqual({
      '--button-background': treeToWalk.button.background.dark,
    });
  });

  it('supports having a `light` and `dark` key', () => {
    const treeToWalk = {
      nav: {
        light: {
          text: '#fff',
          background: '#000',
        },
        dark: {
          text: '#000',
          background: '#fff',
        },
      },
    };
    const result = {
      '--nav-light-text': treeToWalk.nav.light.text,
      '--nav-light-background': treeToWalk.nav.light.background,
      '--nav-dark-text': treeToWalk.nav.dark.text,
      '--nav-dark-background': treeToWalk.nav.dark.background,
    };
    // both are the same, because the end values are not `light/dark`
    expect(objectToCustomProperties(treeToWalk, 'light')).toEqual(result);
    expect(objectToCustomProperties(treeToWalk, 'dark')).toEqual(result);
  });

  it('does not retrieve a value, not specified for current color scheme', () => {
    const treeToWalk = {
      nav: {
        text: {
          dark: '#fff',
        },
      },
    };
    expect(objectToCustomProperties(treeToWalk, 'light')).toEqual({});
    expect(objectToCustomProperties(treeToWalk, 'dark')).toEqual({
      '--nav-text': '#fff',
    });
  });
});
