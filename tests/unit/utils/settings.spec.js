/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

let Settings;

describe('Settings', () => {
  const getItem = jest.fn();
  const setItem = jest.fn();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem,
        setItem,
      },
    });
    // eslint-disable-next-line global-require
    Settings = require('docc-render/utils/settings').default;
  });

  it('sets and gets `preferredColorScheme` from localStorage', () => {
    Settings.preferredColorScheme = 'dark';
    expect(setItem).toHaveBeenCalledWith('developer.setting.preferredColorScheme', 'dark');

    // eslint-disable-next-line no-unused-expressions
    Settings.preferredColorScheme;
    // assert it first tried the old deprecated key
    expect(getItem).toHaveBeenCalledWith('docs.setting.preferredColorScheme');
    // then falls back to the new key
    expect(getItem).toHaveBeenCalledWith('developer.setting.preferredColorScheme');
  });

  it('retrieves `preferredColorScheme` from the deprecated key, if the `present` key is falsy', () => {
    getItem.mockImplementation((key) => {
      if (key === 'docs.setting.preferredColorScheme') return 'old';
      return undefined;
    });
    expect(Settings.preferredColorScheme).toEqual('old');
  });

  it('retrieves `preferredColorScheme` from the new key, if old is falsy', () => {
    getItem.mockImplementation((key) => {
      if (key === 'docs.setting.preferredColorScheme') return undefined;
      return 'new';
    });
    expect(Settings.preferredColorScheme).toEqual('new');
  });

  it('sets and gets `preferredLanguage` from localStorage', () => {
    Settings.preferredLanguage = 'objc';
    expect(setItem).toHaveBeenCalledWith('docs.setting.preferredLanguage', 'objc');

    // eslint-disable-next-line no-unused-expressions
    Settings.preferredLanguage;
    expect(getItem).toHaveBeenCalledWith('docs.setting.preferredLanguage');
  });
});
