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
  shallowMount,
  RouterLinkStub,
} from '@vue/test-utils';
import TutorialsNavigationLink
  from 'docc-render/components/TutorialsOverview/TutorialsNavigationLink.vue';
import scrollToElement from 'docc-render/mixins/scrollToElement';

jest.mock('docc-render/mixins/scrollToElement', () => ({
  methods: { handleFocusAndScroll: jest.fn() },
}));

describe('TutorialsNavigationLink', () => {
  let wrapper;

  const slots = { default: 'hello world' };
  const stubs = { 'router-link': RouterLinkStub };
  const query = {
    context: 'foo',
  };

  beforeEach(() => {
    wrapper = shallowMount(TutorialsNavigationLink, {
      slots,
      stubs,
      mocks: {
        $route: {
          query,
        },
      },
    });
  });

  it('renders a router-link.tutorials-navigation-link', () => {
    const link = wrapper.find(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.classes('tutorials-navigation-link')).toBe(true);
  });

  it('renders the slot as the link text', () => {
    expect(wrapper.text()).toBe(slots.default);
  });

  it('renders the anchorized slot text as the url fragment location', () => {
    const link = wrapper.find(RouterLinkStub);
    expect(link.props('to')).toEqual({ hash: 'hello-world', query });
  });

  it('renders an .active modifier if the text matches the active tutorial link', () => {
    let link = wrapper.find(RouterLinkStub);
    expect(link.classes('active')).toBe(false);

    wrapper = shallowMount(TutorialsNavigationLink, {
      slots,
      stubs,
      provide: {
        store: {
          state: { activeTutorialLink: slots.default },
        },
      },
      mocks: {
        $route: {
          query,
        },
      },
    });
    link = wrapper.find(RouterLinkStub);
    expect(link.classes('active')).toBe(true);
  });

  it('focuses the element when clicked, used for AX', async () => {
    const link = wrapper.find(RouterLinkStub);
    link.trigger('click');
    await wrapper.vm.$nextTick();
    expect(scrollToElement.methods.handleFocusAndScroll).toHaveBeenCalledWith('hello-world');
  });
});
