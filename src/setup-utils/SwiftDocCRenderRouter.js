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
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import {
  saveScrollOnReload,
  restoreScrollOnReload,
  scrollBehavior,
} from 'docc-render/utils/router-utils';
import routes, { fallbackRoutes } from 'docc-render/routes';
import { baseUrl } from 'docc-render/utils/theme-settings';
import { addPrefixedRoutes } from 'docc-render/utils/route-utils';

const defaultRoutes = [
  ...addPrefixedRoutes(routes),
  ...fallbackRoutes,
];

const createHistory = (mode, base) => ({
  abstract: createMemoryHistory,
  hash: createWebHashHistory,
  history: createWebHistory,
}[mode] || createWebHistory)(base);

export default function createRouterInstance(routerConfig = {}) {
  const {
    base = baseUrl,
    mode = 'history',
    history = createHistory(mode, base),
    routes: configuredRoutes,
    ...config
  } = routerConfig;
  const router = createRouter({
    history,
    scrollBehavior,
    ...config,
    routes: configuredRoutes || defaultRoutes,
  });

  router.isReady().then(() => {
    // Disable the browser's automatic scroll restoration mechanism so that it doesn't
    // interfere with vue-router's scrollBehavior.
    // https://github.com/vuejs/vue-router/pull/1814
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    restoreScrollOnReload();
  });

  if (process.env.VUE_APP_TARGET !== 'ide') {
    router.onError((error) => {
      const { route = { path: '/' } } = error;
      router.replace({
        name: 'server-error',
        params: { pathMatch: route.path.split('/').filter(Boolean) },
      });
    });
  }

  // save the scrollPosition when we quit the tab. eg: reload
  window.addEventListener('unload', saveScrollOnReload);

  return router;
}
