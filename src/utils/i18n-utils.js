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
 * @param {String} slug - locale code
 */
export function localeIsValid(slug) {
  return !!codeForSlug[slug];
}

/**
 * Updates i18n global var and html lang
 * @param {String} locale - locale used
 * @param {Object} env - context
 */
export function updateLocale(slug = defaultLocale, env) {
  // exist if current locale is not supported
  if (!localeIsValid(slug)) return;
  // update locale global var
  env.$i18n.locale = slug; // eslint-disable-line no-param-reassign
  // get code
  const code = getCodeForSlug(slug);
  // update html lang
  updateLangTag(code);
}
