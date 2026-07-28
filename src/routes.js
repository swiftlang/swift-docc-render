/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  documentationTopicName,
  notFoundRouteName,
  serverErrorRouteName,
} from 'docc-render/constants/router';
import ServerError from 'theme/views/ServerError.vue';
import NotFound from 'theme/views/NotFound.vue';

export const fallbackRoutes = [
  {
    path: '/:pathMatch(.*)',
    name: notFoundRouteName,
    component: NotFound,
  },
  {
    path: '/__server-error/:pathMatch(.*)', // purposefully unreachable without a forced navigation
    name: serverErrorRouteName,
    component: ServerError,
  },
];

export const pagesRoutes = [
  {
    path: '/tutorials/:id',
    name: 'tutorials-overview',
    component: () => import(
      'theme/views/TutorialsOverview.vue'
    ),
  },
  {
    path: '/tutorials/:id/:pathMatch(.*)',
    name: 'topic',
    component: () => import(
      'theme/views/Topic.vue'
    ),
  },
  {
    path: '/documentation:pathMatch(.*)',
    name: documentationTopicName,
    component: () => import(
      'theme/views/DocumentationTopic.vue'
    ),
  },
];

export default [
  ...pagesRoutes,
  ...fallbackRoutes,
];
