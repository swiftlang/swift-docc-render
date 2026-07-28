/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { config } from '@vue/test-utils';
import PortalVue from 'portal-vue';
import { defaultLocale } from 'theme/lang/index';
import { vi } from 'vitest';

process.env.VUE_APP_TITLE = 'Documentation';
window.TransitionEvent = window.TransitionEvent || window.Event;
window.IntersectionObserver = vi.fn().mockImplementation(class MockIntersectionObserver {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? '0px';
    this.thresholds = options.threshold ?? [0];
  }

  disconnect = vi.fn();

  observe = vi.fn();

  unobserve = vi.fn();
});

config.global.mocks = {
  $t: (tKey, secondParam) => (secondParam ? [tKey, ...Object.values(secondParam)].join(' ') : tKey),
  $tc: tKey => tKey,
  $i18n: {
    locale: defaultLocale,
  },
};
config.global.renderStubDefaultSlot = true;
config.global.plugins = [PortalVue];
config.global.config = {
  compilerOptions: {
    whitespace: 'preserve',
  },
};
