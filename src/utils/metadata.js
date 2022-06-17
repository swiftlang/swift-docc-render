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

const themeTitle = getSetting(['meta', 'title'], process.env.VUE_APP_TITLE);

const createMetaTags = ({ title, description, path }, urlResolver = resolveAbsoluteUrl) => [
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
    content: urlResolver(path),
  },
  {
    property: 'og:image',
    content: urlResolver('/developer-og.jpg'),
  },
  {
    name: 'twitter:image',
    content: urlResolver('/developer-og-twitter.jpg'),
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
    content: urlResolver(path),
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
export function addOrUpdateMetadata({ title, description, path }, urlResolver) {
  const formattedTitle = formatTitle(title);
  // add title
  addTitle(formattedTitle);
  // create and add metadata tags
  createMetaTags({ title: formattedTitle, description, path }, urlResolver).forEach(
    metadata => addOrUpdateMetaTag(metadata),
  );
}
