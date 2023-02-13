/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import appLocales from 'docc-render/lang/locales.json';
import { defaultLocale } from 'docc-render/lang';
import { updateLangTag } from 'docc-render/utils/metadata';

const localeCodes = new Set(appLocales.map(appLocale => appLocale.code));

/**
 * Check if locale is valid
 * @param {String} localeCode - locale code
 * @param {{ code: String }[]} locales - locales available
 */
export function localeIsValid(localeCode) {
  return localeCodes.has(localeCode);
}

/**
 * Updates i18n global var and html lang
 * @param {{ params: { locale: String } }} to - where the route navigates to
 * @param {Object{}} env - context
 * @param {{ code: String, name: String }[]} locales
 */
export function updateCurrentLocale(to, env) {
  const currentLocale = to.params.locale || defaultLocale;
  // exist if current locale is not supported
  if (!localeIsValid(currentLocale)) return;
  // update locale global var
  env.$i18n.locale = currentLocale; // eslint-disable-line no-param-reassign
  // update html lang
  updateLangTag(currentLocale);
}
