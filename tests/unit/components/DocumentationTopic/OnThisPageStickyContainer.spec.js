/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import OnThisPageStickyContainer, {
  ON_THIS_PAGE_CONTENT_BREAKPOINT, ON_THIS_PAGE_CONTENT_BREAKPOINT_BIG,
} from '@/components/DocumentationTopic/OnThisPageStickyContainer.vue';
import { shallowMount } from '@vue/test-utils';
import Vue from 'vue';

const store = Vue.observable({
  state: {
    contentWidth: ON_THIS_PAGE_CONTENT_BREAKPOINT + 100,
  },
});

const createWrapper = ({ provide, ...others } = {}) => shallowMount(OnThisPageStickyContainer, {
  provide: {
    store,
    ...provide,
  },
  slots: {
    default: '<div class="default">Default Content</div>',
  },
  ...others,
});

describe('OnThisPageStickyContainer', () => {
  it('renders the OnThisPageStickyContainer as visible, when above a threshold', () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('renders the OnThisPageStickyContainer as hidden, when under a threshold', () => {
    const wrapper = createWrapper();
    store.state.contentWidth = ON_THIS_PAGE_CONTENT_BREAKPOINT - 200;
    expect(wrapper.classes()).toContain('hidden');
    store.state.contentWidth = ON_THIS_PAGE_CONTENT_BREAKPOINT + 1;
    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('renders the OnThisPageStickyContainer as hidden, when under the big threshold', () => {
    window.outerWidth = 1500;
    store.state.contentWidth = ON_THIS_PAGE_CONTENT_BREAKPOINT_BIG - 100;
    const wrapper = createWrapper();
    expect(wrapper.classes()).toContain('hidden');
    store.state.contentWidth = ON_THIS_PAGE_CONTENT_BREAKPOINT_BIG + 10;
    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('renders the default slot', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.default').text()).toBe('Default Content');
  });
});
