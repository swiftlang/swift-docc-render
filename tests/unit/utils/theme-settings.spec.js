/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  fetchThemeSettings,
  getSetting,
  themeSettingsState,
} from '@/utils/theme-settings';

const themeSettings = {
  theme: 'foo',
};

const jsonMock = vi.fn().mockResolvedValue(themeSettings);
const fetchMock = vi.fn().mockResolvedValue({
  json: jsonMock,
});

const { resolveAbsoluteUrlMock } = vi.hoisted(() => ({
  resolveAbsoluteUrlMock: vi.fn(),
}));

vi.mock('docc-render/utils/url-helper', () => ({
  resolveAbsoluteUrl: resolveAbsoluteUrlMock,
}));

window.fetch = fetchMock;

describe('theme-settings', () => {
  beforeEach(() => {
    const base = document.createElement('base');
    document.head.appendChild(base);
    themeSettingsState.theme = {};
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.head.querySelector('base')?.remove();
  });

  it('fetches the theme settings from a remote path', async () => {
    document.head.querySelector('base').setAttribute('href', '/');
    resolveAbsoluteUrlMock.mockReturnValue('http://localhost/theme-settings.json');
    await fetchThemeSettings();
    expect(resolveAbsoluteUrlMock).toHaveBeenCalledWith('/theme-settings.json');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost/theme-settings.json');
    expect(jsonMock).toHaveBeenCalledTimes(1);
  });

  it('uses the base href for the json path', async () => {
    document.head.querySelector('base').setAttribute('href', '/bar/foo/');
    resolveAbsoluteUrlMock.mockReturnValue('http://localhost/bar/foo/theme-settings.json');
    await fetchThemeSettings();
    expect(resolveAbsoluteUrlMock).toHaveBeenCalledWith('/theme-settings.json');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost/bar/foo/theme-settings.json');
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
