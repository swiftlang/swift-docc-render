/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { config, RouterLinkStub } from '@vue/test-utils';
import PortalVue from 'portal-vue';
import { defaultLocale } from 'theme/lang/index';
import { vi } from 'vitest';
import { defineComponent, h } from 'vue';

const readOnlyElementProperties = new Set(['attributes', 'children', 'prefix']);

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
config.global.stubs = {
  'router-link': RouterLinkStub,
};
config.plugins.createStubs = ({ name, component, registerStub }) => {
  const componentOptions = component.__vccOpts || component;
  const stub = defineComponent({
    name: name || 'AnonymousStub',
    props: componentOptions.props || {},
    setup(props, { slots }) {
      return () => {
        const forwardedProps = Object.fromEntries(
          Object.entries(props).filter(([key]) => !readOnlyElementProperties.has(key)),
        );
        return h(
          `${(name || 'anonymous').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()}-stub`,
          forwardedProps,
          config.global.renderStubDefaultSlot ? slots.default?.({}) : undefined,
        );
      };
    },
  });

  registerStub({ source: component, stub });
  return stub;
};
config.global.config = {
  compilerOptions: {
    whitespace: 'preserve',
  },
  warnHandler(message, instance, trace) {
    throw new Error(`[Vue warn]: ${message}${trace}`);
  },
};
