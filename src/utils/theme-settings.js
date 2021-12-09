/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import get from 'docc-render/utils/get';

/**
 * Theme settings state.
 * Overwritten with data, fetched at boot time.
 */
export const themeSettingsState = {
  meta: {},
  theme: {},
  features: {},
};
export const { baseUrl } = window;

/**
 * Method to fetch the theme settings and store in local module state.
 * Method is called before Vue boots in `main.js`.
 * @return {Promise<{}>}
 */
export async function fetchThemeSettings() {
  const url = new URL(`${baseUrl}theme-settings.json`, window.location.href);
  return fetch(url.href)
    .then(r => r.json())
    .catch(() => ({}));
}

export const getSetting = (path, fallback) => get(themeSettingsState, path, fallback);
