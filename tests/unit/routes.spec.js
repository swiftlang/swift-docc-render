/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { createMemoryHistory, createRouter } from 'vue-router';
import LocaleSelector from 'docc-render/components/LocaleSelector.vue';
import SuggestLang from 'docc-render/components/SuggestLang.vue';
import { defaultLocale } from 'theme/lang/index';
import { addPrefixedRoutes } from 'docc-render/utils/route-utils';
import { fallbackRoutes, pagesRoutes } from 'docc-render/routes';

const stub = { render: () => null };

// Same route table as the default `createRouterInstance`, with stubbed views so
// navigating doesn't trigger their data fetching guards.
const createTestRouter = () => createRouter({
  history: createMemoryHistory(),
  routes: [
    ...addPrefixedRoutes(pagesRoutes),
    ...fallbackRoutes,
  ].map(route => ({ ...route, component: stub })),
});

describe('routes', () => {
  let router;

  const localeHrefs = (slug) => {
    const context = {
      $router: router,
      $route: router.currentRoute.value,
      preferredLocale: slug,
    };
    return [
      LocaleSelector.methods.hrefForLocale.call(context, slug),
      SuggestLang.computed.preferredLocaleHref(context),
    ];
  };

  beforeEach(() => {
    router = createTestRouter();
  });

  it.each([
    ['/documentation', 'documentation-topic-locale', {}],
    ['/documentation/swiftui/view', 'documentation-topic-locale', {
      pathMatch: ['swiftui', 'view'],
    }],
    ['/ja-JP/documentation/swiftui', 'documentation-topic-locale', {
      locale: 'ja-JP', pathMatch: ['swiftui'],
    }],
    ['/tutorials/swiftui', 'tutorials-overview-locale', { id: 'swiftui' }],
    ['/tutorials/swiftui/creating-and-combining-views', 'topic-locale', {
      id: 'swiftui',
      pathMatch: ['creating-and-combining-views'],
    }],
    ['/not/a/page', 'not-found', { pathMatch: ['not', 'a', 'page'] }],
  ])('matches %s', (path, name, params) => {
    expect(router.resolve(path)).toMatchObject({ name, params });
  });

  it.each([
    ['/documentation', '/ja-JP/documentation'],
    ['/documentation/swiftui', '/ja-JP/documentation/swiftui'],
    ['/documentation/swiftui/view', '/ja-JP/documentation/swiftui/view'],
    [
      '/tutorials/swiftui/creating-and-combining-views',
      '/ja-JP/tutorials/swiftui/creating-and-combining-views',
    ],
  ])('links %s to its localized version without encoding slashes', async (path, expected) => {
    await router.push(path);
    expect(localeHrefs('ja-JP')).toEqual([expected, expected]);
  });

  it.each([
    ['/ja-JP/documentation', '/documentation'],
    ['/ja-JP/documentation/swiftui/view', '/documentation/swiftui/view'],
    [
      '/ja-JP/tutorials/swiftui/creating-and-combining-views',
      '/tutorials/swiftui/creating-and-combining-views',
    ],
  ])('links %s back to the default locale version', async (path, expected) => {
    await router.push(path);
    expect(localeHrefs(defaultLocale)).toEqual([expected, expected]);
  });

  it('switches between non-default locales', async () => {
    await router.push('/ja-JP/documentation/swiftui/view');
    expect(localeHrefs('zh-CN')).toEqual([
      '/zh-CN/documentation/swiftui/view',
      '/zh-CN/documentation/swiftui/view',
    ]);
  });

  it('keeps the query when linking to another locale', async () => {
    await router.push('/documentation/swiftui/view?language=objc');
    expect(localeHrefs('ja-JP')).toEqual([
      '/ja-JP/documentation/swiftui/view?language=objc',
      '/ja-JP/documentation/swiftui/view?language=objc',
    ]);
  });
});
