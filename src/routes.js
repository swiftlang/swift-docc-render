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

export const homeRoute = {
  path: '/',
  name: 'home-index',
  component: () => import(
    /* webpackChunkName: "home-index" */ 'theme/views/Index.vue'
  ),
};

export const fallbackRoutes = [
  {
    path: '*',
    name: notFoundRouteName,
    component: NotFound,
  },
  {
    path: '*', // purposefully unreachable without a forced navigation
    name: serverErrorRouteName,
    component: ServerError,
  },
];

export const pagesRoutes = [
  {
    path: '/tutorials/:id',
    name: 'tutorials-overview',
    component: () => import(
      /* webpackChunkName: "tutorials-overview" */ 'theme/views/TutorialsOverview.vue'
    ),
  },
  {
    path: '/tutorials/:id/*',
    name: 'topic',
    component: () => import(
      /* webpackChunkName: "topic" */ 'theme/views/Topic.vue'
    ),
  },
  {
    path: '/documentation*',
    name: documentationTopicName,
    component: () => import(
      /* webpackChunkName: "documentation-topic" */ 'theme/views/DocumentationTopic.vue'
    ),
  },
];

export default [
  homeRoute,
  ...pagesRoutes,
  ...fallbackRoutes,
];
