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
import { normalizeAssetUrl } from 'docc-render/utils/assets';

const themeTitle = getSetting(['meta', 'title'], process.env.VUE_APP_TITLE);
const DEFAULT_DESCRIPTION = 'There\'s never been a better time to develop for Apple platforms.';
const createMetaTags = ({ title, description, path }) => [
  {
    name: 'description',
    content: description,
  },
  {
    property: 'og:locale',
    content: 'en_US',
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
    content: normalizeAssetUrl(path),
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
    content: normalizeAssetUrl(path),
  },
];
const formatTitle = title => [title, themeTitle].filter(Boolean).join(' | ');
const addMetaTags = (metadata) => {
  const meta = document.createElement('meta');
  Object.keys(metadata).forEach(ref => meta.setAttribute(ref, metadata[ref]));
  document.getElementsByTagName('head')[0].appendChild(meta);
};
const addTitle = (title) => {
  // eslint-disable-next-line no-param-reassign
  document.title = title;
};

/**
 * It adds client-side metadata tags to pages
 * @param {Object} pageData
 */
// eslint-disable-next-line import/prefer-default-export
export function addMetadata({ title, description = DEFAULT_DESCRIPTION, path }) {
  const formattedTitle = formatTitle(title);
  // add title
  addTitle(formattedTitle);
  // create and add metadata tags
  createMetaTags({ title: formattedTitle, description, path }).forEach(
    metadata => addMetaTags(metadata),
  );
}
