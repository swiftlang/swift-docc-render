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
import { defaultLocale } from 'theme/lang/index';
import { updateLangTag } from 'docc-render/utils/metadata';

const codeForSlug = locales.reduce((map, locale) => ({
  ...map,
  [locale.slug]: locale.code,
}), {});

/**
 * Get locale code from slug
 * @param {String} slug
 * @return {String}
 */
export function getCodeForSlug(slug) {
  return codeForSlug[slug];
}

/**
 * Check if locale is valid
 * @param {String} slug - locale slug
 */
export function localeIsValid(slug) {
  return !!codeForSlug[slug];
}

/**
 * Returns params object to update router according to the new locale
 * @param {String} slug - locale slug
 */
export function getLocaleParam(slug) {
  return {
    params: {
      // An empty string removes the optional locale param, while `undefined`
      // would be dropped by Vue Router and keep the current locale instead.
      locale: slug === defaultLocale ? '' : slug,
    },
  };
}

/**
 * Updates i18n global var and html lang
 * @param {String} slug - locale used
 * @param {Object} env - context
 */
export function updateLocale(slug, env = {}) {
  // routes without a locale param use the default locale
  const locale = slug || defaultLocale;
  // exist if current locale is not supported
  if (!localeIsValid(locale)) return;
  // update locale global var
  env.$i18n.locale = locale; // eslint-disable-line no-param-reassign
  // get code
  const code = getCodeForSlug(locale);
  // update html lang
  updateLangTag(code);
}
