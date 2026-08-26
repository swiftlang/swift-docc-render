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
import { normalizeRelativePath, pathJoin } from 'docc-render/utils/assets';

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
      locale: slug === defaultLocale ? undefined : slug,
    },
  };
}

/**
 * Prefixes a path with the given locale slug, so that navigation stays within
 * the current locale.
 * @param {String} path - a path, with or without a leading slash
 * @param {String} [locale] - the locale slug to prefix with
 * @return {String}
 */
export function pathWithLocale(path, locale) {
  if (!path) return path;
  const normalizedPath = normalizeRelativePath(path);
  // No prefix needed for the default locale (routes declare locale as optional).
  if (!locale || locale === defaultLocale || !localeIsValid(locale)) {
    return normalizedPath;
  }
  return pathJoin(['/', locale, normalizedPath]);
}

/**
 * Updates i18n global var and html lang
 * @param {String} slug - locale used
 * @param {Object} env - context
 */
export function updateLocale(slug = defaultLocale, env = {}) {
  // exist if current locale is not supported
  if (!localeIsValid(slug)) return;
  // update locale global var
  env.$i18n.locale = slug; // eslint-disable-line no-param-reassign
  // get code
  const code = getCodeForSlug(slug);
  // update html lang
  updateLangTag(code);
}
