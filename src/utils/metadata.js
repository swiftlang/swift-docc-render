/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { getSetting } from 'docc-render/utils/theme-settings';
import { resolveAbsoluteUrl } from 'docc-render/utils/url-helper';
import locales from 'theme/lang/locales.json';

const themeTitle = getSetting(['meta', 'title'], process.env.VUE_APP_TITLE);

const createMetaTags = ({
  title,
  description,
  url,
  currentLocale,
}) => [
  {
    name: 'description',
    content: description,
  },
  {
    property: 'og:locale',
    content: currentLocale,
  },
  {
    property: 'og:site_name',
    content: themeTitle,
  },
  {
    property: 'og:type',
    content: 'website',
  },
  {
    property: 'og:title',
    content: title,
  },
  {
    property: 'og:description',
    content: description,
  },
  {
    property: 'og:url',
    content: url,
  },
  {
    property: 'og:image',
    content: resolveAbsoluteUrl('/developer-og.jpg'),
  },
  {
    name: 'twitter:image',
    content: resolveAbsoluteUrl('/developer-og-twitter.jpg'),
  },
  {
    name: 'twitter:card',
    content: 'summary_large_image',
  },
  {
    name: 'twitter:description',
    content: description,
  },
  {
    name: 'twitter:title',
    content: title,
  },
  {
    name: 'twitter:url',
    content: url,
  },
];

const formatTitle = title => [title, themeTitle].filter(Boolean).join(' | ');

const addOrUpdateMetaTag = (metadata) => {
  const { content } = metadata;
  const key = metadata.property ? 'property' : 'name';
  const ref = metadata[key];

  const existingMetaElement = document.querySelector(`meta[${key}="${ref}"]`);
  if (existingMetaElement && content) {
    existingMetaElement.setAttribute('content', content);
  } else if (existingMetaElement && !content) {
    existingMetaElement.remove();
  } else if (content) {
    const newMetaElement = document.createElement('meta');
    newMetaElement.setAttribute(key, metadata[key]);
    newMetaElement.setAttribute('content', metadata.content);
    document.getElementsByTagName('head')[0].appendChild(newMetaElement);
  }
};

const addTitle = (title) => {
  // eslint-disable-next-line no-param-reassign
  document.title = title;
};

/**
 * It adds or updates client-side metadata tags to pages
 * @param {Object} pageData
 */
// eslint-disable-next-line import/prefer-default-export
export function addOrUpdateMetadata({
  title,
  description,
  url,
  currentLocale,
}) {
  const formattedTitle = formatTitle(title);
  // add title
  addTitle(formattedTitle);
  // create and add metadata tags
  createMetaTags({
    title: formattedTitle,
    description,
    url,
    currentLocale,
  }).forEach(
    metadata => addOrUpdateMetaTag(metadata),
  );
}

/**
 * It returns the iso code of a language in case it exists
 * @param {String} code
 */
export function getISO(code) {
  return locales.find(locale => locale.code === code).iso;
}

/**
 * It updates the document setting a new lang attribute with the iso code or fallback on the locale
 * @param {String} locale
 */
export function updateLangTag(locale) {
  document.querySelector('html').setAttribute('lang', getISO(locale) || locale);
}
