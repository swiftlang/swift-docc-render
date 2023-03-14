/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import locales from 'theme/lang/locales.json';
import { defaultLocale } from 'theme/lang/index.js';
import { updateLangTag } from 'docc-render/utils/metadata';

const localeCodes = new Set(locales.map(appLocale => appLocale.code));

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
 * @param {String} locale - locale used
 * @param {Object{}} env - context
 */
export function updateLocale(locale = defaultLocale, env) {
  // exist if current locale is not supported
  if (!localeIsValid(locale)) return;
  // update locale global var
  env.$i18n.locale = locale; // eslint-disable-line no-param-reassign
  // update html lang
  updateLangTag(locale);
}

/**
 * Updates i18n global var and html lang
 * @param {{ params: { locale: String } }} to - where the route navigates to
 * @param {Object{}} env - context
 */
export function updateCurrentLocale(to, env) {
  const currentLocale = to.params.locale;
  updateLocale(currentLocale, env);
}

/**
 * Get locale slug from locale code
 * @param {String} localeCode - locale code
 * @return {String}
 */
export function getSlug(localeCode) {
  const locale = locales.find(({ code }) => code === localeCode);
  return locale ? locale.slug : '';
}
