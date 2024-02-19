/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { TopicTypes } from 'docc-render/constants/TopicTypes';

export const HIDE_DEPRECATED = 'navigator.tags.hide-deprecated';

export const FILTER_TAGS = {
  sampleCode: 'filter.tags.sample-code',
  tutorials: 'filter.tags.tutorials',
  articles: 'filter.tags.articles',
  webServiceEndpoints: 'filter.tags.web-service-endpoints',
};

export const TOPIC_TYPE_TO_TAG = {
  [TopicTypes.article]: FILTER_TAGS.articles,
  [TopicTypes.learn]: FILTER_TAGS.tutorials,
  [TopicTypes.overview]: FILTER_TAGS.tutorials,
  [TopicTypes.resources]: FILTER_TAGS.tutorials,
  [TopicTypes.sampleCode]: FILTER_TAGS.sampleCode,
  [TopicTypes.section]: FILTER_TAGS.tutorials,
  [TopicTypes.tutorial]: FILTER_TAGS.tutorials,
  [TopicTypes.project]: FILTER_TAGS.tutorials,
  [TopicTypes.httpRequest]: FILTER_TAGS.webServiceEndpoints,
};
