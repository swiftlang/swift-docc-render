/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

let fetchThemeSettings;
let getSetting;
let themeSettingsState;

const themeSettings = {
  theme: 'foo',
};

const jsonMock = jest.fn().mockResolvedValue(themeSettings);
const fetchMock = jest.fn().mockResolvedValue({
  json: jsonMock,
});

function importDeps() {
  jest.resetModules();
  // eslint-disable-next-line global-require
  ({ fetchThemeSettings, getSetting, themeSettingsState } = require('@/utils/theme-settings'));
}

window.fetch = fetchMock;

describe('theme-settings', () => {
  beforeEach(() => {
    process.env.BASE_URL = '/';
    importDeps();
    jest.clearAllMocks();
  });

  it('fetches the theme settings from a remote path', async () => {
    await fetchThemeSettings();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost/theme-settings.json');
    expect(jsonMock).toHaveBeenCalledTimes(1);
  });

  it('uses the BASE_URL for the json path', async () => {
    process.env.BASE_URL = '/foo/bar/';
    importDeps();
    await fetchThemeSettings();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost/foo/bar/theme-settings.json');
    expect(jsonMock).toHaveBeenCalledTimes(1);
  });

  it('silences errors while fetching theme settings', async () => {
    fetchMock.mockRejectedValueOnce('Foo is not JSON');
    expect(await fetchThemeSettings()).toEqual({});
  });

  it('retrieves already stored data', async () => {
    expect(getSetting(['theme'])).toEqual({});
    Object.assign(themeSettingsState, themeSettings);
    expect(getSetting(['theme'])).toEqual(themeSettings.theme);
  });
});
